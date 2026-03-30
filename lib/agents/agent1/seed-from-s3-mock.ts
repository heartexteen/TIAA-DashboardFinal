/**
 * Agent 1 (Extractor) - SEED MODE (S3-BASED, NO LOCAL MOCK FILES)
 * ---------------------------------------------------------------
 *
 * Goal:
 * - You asked for "zero peeking" at the local `lib/mock-data.ts`.
 * - This implementation seeds Agent 1 output JSON purely by reading `mock-data.ts`
 *   that you placed in S3 under:
 *
 *     s3://<bucket>/agent1(extractor)-input(PDF)/mock-data.ts
 *
 * What it does:
 * 1) Downloads the S3 object (TypeScript source as text)
 * 2) Parses it with the TypeScript compiler API (AST) WITHOUT executing it
 * 3) Extracts the exported `const` values we need (clients, ips/rtq/estate datasets, etc.)
 * 4) Writes per-client JSON artifacts into:
 *     s3://<bucket>/agent1(extractor)-output(json)/<clientKey>/...
 *
 * Why AST parsing (instead of eval)?
 * - Safer: no executing arbitrary code from S3.
 * - Deterministic: we only evaluate object/array/string/number literals + "as const".
 *
 * IMPORTANT limitations (acceptable for seed-mode):
 * - Only supports literal-ish TS expressions (object literals, arrays, primitives, `as const`).
 * - If your S3 mock-data.ts starts using computed values/functions, this will fail by design.
 */

import { getTiaaS3Config } from "@/lib/aws/config"
import { s3GetText, s3PutJson } from "@/lib/aws/s3"

/**
 * The exported values we expect to exist inside `mock-data.ts` in S3.
 * If you rename any of these exports, update this list.
 */
type S3SeedExports = {
  clients: any[]

  carinaIPSData: any
  carinaRTQData: any
  carinaEstateData: any
  aiSuggestedActions: any[]
  meetingTopics: any[]

  johnSmithIPSData: any
  johnSmithRTQData: any
  johnSmithEstateData: any
  johnSmithAISuggestedActions: any[]
  johnSmithMeetingTopics: any[]
}

/**
 * Extracts `export const X = <initializer>` values from a TypeScript module
 * and evaluates ONLY safe literal expressions.
 */
async function parseExportedConstsFromTypeScriptSource(sourceText: string): Promise<Record<string, any>> {
  // Dynamic import keeps this file usable even if you later remove TypeScript from prod installs.
  // (The seed endpoint is primarily for development / bootstrapping.)
  const ts = await import("typescript")

  const sf = ts.createSourceFile("mock-data.ts", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  function fail(node: any, message: string): never {
    const { line, character } = sf.getLineAndCharacterOfPosition(node.pos)
    throw new Error(`S3 mock-data.ts parse error at ${line + 1}:${character + 1}: ${message}`)
  }

  /**
   * Evaluate a TypeScript expression to a plain JS value.
   * Supported:
   * - Object/array literals
   * - String/number/boolean/null
   * - `as const` / type assertions
   * - Unary minus (for negative numbers)
   */
  function evalExpr(expr: any): any {
    if (!expr) return undefined

    // Strip parentheses
    if (ts.isParenthesizedExpression(expr)) return evalExpr(expr.expression)

    // Handle `as const` and type assertions
    if (ts.isAsExpression(expr)) return evalExpr(expr.expression)
    if (ts.isTypeAssertionExpression(expr)) return evalExpr(expr.expression)

    // Primitives
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text
    if (ts.isNumericLiteral(expr)) return Number(expr.text)
    if (expr.kind === ts.SyntaxKind.TrueKeyword) return true
    if (expr.kind === ts.SyntaxKind.FalseKeyword) return false
    if (expr.kind === ts.SyntaxKind.NullKeyword) return null

    // Unary (-123)
    if (ts.isPrefixUnaryExpression(expr)) {
      if (expr.operator === ts.SyntaxKind.MinusToken) return -Number(evalExpr(expr.operand))
      if (expr.operator === ts.SyntaxKind.PlusToken) return Number(evalExpr(expr.operand))
      return fail(expr, `Unsupported unary operator: ${ts.tokenToString(expr.operator)}`)
    }

    // Arrays
    if (ts.isArrayLiteralExpression(expr)) {
      return expr.elements.map((el: any) => evalExpr(el))
    }

    // Objects
    if (ts.isObjectLiteralExpression(expr)) {
      const out: Record<string, any> = {}
      for (const prop of expr.properties) {
        // { a: 1 }
        if (ts.isPropertyAssignment(prop)) {
          let key = ""
          if (ts.isIdentifier(prop.name)) key = prop.name.text
          else if (ts.isStringLiteral(prop.name) || ts.isNumericLiteral(prop.name)) key = String(prop.name.text)
          else return fail(prop, "Unsupported object property name (only identifiers/strings/numbers).")

          out[key] = evalExpr(prop.initializer)
          continue
        }

        // { a } shorthand
        if (ts.isShorthandPropertyAssignment(prop)) {
          return fail(prop, "Shorthand property assignment not supported in seed data.")
        }

        // { ...x }
        if (ts.isSpreadAssignment(prop)) {
          return fail(prop, "Spread assignment not supported in seed data.")
        }

        return fail(prop, "Unsupported object literal property type.")
      }
      return out
    }

    return fail(expr, `Unsupported expression kind: ${ts.SyntaxKind[expr.kind]}`)
  }

  const exports: Record<string, any> = {}

  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue

    const isExported = (stmt.modifiers || []).some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword)
    if (!isExported) continue

    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue
      const name = decl.name.text
      if (!decl.initializer) continue
      exports[name] = evalExpr(decl.initializer)
    }
  }

  return exports
}

function buildProfileComparison(ipsData: any, rtqData: any) {
  const rows: Array<{ category: string; ipsValue: string; rtqValue: string; status: string; note?: string }> = []

  const ipsRisk = String(ipsData?.riskTolerance || "")
  const rtqRisk = String(rtqData?.riskAssessment?.riskProfile || "")
  if (ipsRisk || rtqRisk) {
    rows.push({
      category: "Risk Tolerance",
      ipsValue: ipsRisk || "Unknown",
      rtqValue: rtqRisk || "Unknown",
      status: ipsRisk && rtqRisk && ipsRisk !== rtqRisk ? "mismatch" : "aligned",
      note: "Derived from IPS riskTolerance and RTQ riskAssessment.riskProfile",
    })
  }

  const ipsHorizon = String(ipsData?.timeHorizon || "")
  const rtqHorizon = String(rtqData?.investmentPreferences?.timeHorizon?.selected || "")
  if (ipsHorizon || rtqHorizon) {
    rows.push({
      category: "Time Horizon",
      ipsValue: ipsHorizon || "Unknown",
      rtqValue: rtqHorizon || "Unknown",
      status: ipsHorizon && rtqHorizon && ipsHorizon !== rtqHorizon ? "mismatch" : "aligned",
      note: "Derived from IPS timeHorizon and RTQ investmentPreferences.timeHorizon.selected",
    })
  }

  // Asset allocation comparison (simple % diffs).
  const ipsAllocs = Array.isArray(ipsData?.targetAssetAllocation?.allocations)
    ? ipsData.targetAssetAllocation.allocations
    : []
  const rtqAlloc = rtqData?.suggestedAssetAllocation || {}

  for (const alloc of ipsAllocs) {
    const assetClass = String(alloc?.assetClass || "Unknown")
    const ipsPct = Number(alloc?.targetAllocation || 0)

    let rtqPct = 0
    if (/equity/i.test(assetClass)) rtqPct = Number(rtqAlloc.equity || 0)
    else if (/fixed/i.test(assetClass)) rtqPct = Number(rtqAlloc.fixedIncome || 0)
    else if (/cash/i.test(assetClass)) rtqPct = Number(rtqAlloc.cash || 0)
    else rtqPct = Number(rtqAlloc.alternatives || rtqAlloc.realAssets || 0)

    const diff = Math.abs(ipsPct - rtqPct)
    rows.push({
      category: `${assetClass} Allocation`,
      ipsValue: `${ipsPct}%`,
      rtqValue: `${rtqPct}%`,
      status: diff >= 15 ? "mismatch" : diff >= 7 ? "warning" : "aligned",
      note: "Derived from IPS targetAssetAllocation vs RTQ suggestedAssetAllocation",
    })
  }

  return rows
}

function keyFor(clientKey: string, file: string) {
  const cfg = getTiaaS3Config()
  return `${cfg.agent1.outputPrefix}${clientKey}/${file}`
}

function findClientByKey(clients: any[], clientKey: string) {
  const lower = clientKey.toLowerCase()
  // Prefer exact id match if already aligned
  let match = clients.find((c) => String(c?.id || "").toLowerCase() === lower)
  if (match) return match

  // Otherwise match on name
  match = clients.find((c) => String(c?.name || "").toLowerCase().includes(lower))
  if (match) return match

  // Otherwise match on old ids (carina-voss / john-smith)
  if (lower === "carina") {
    match = clients.find((c) => String(c?.id || "").toLowerCase().includes("carina"))
  }
  if (lower === "john") {
    match = clients.find((c) => String(c?.id || "").toLowerCase().includes("john"))
  }
  return match || null
}

/**
 * Public entrypoint used by Agent 1 seed graph.
 *
 * Reads S3 mock-data.ts from `agent1(extractor)-input(PDF)/mock-data.ts` by default.
 */
export async function seedAgent1OutputsFromS3MockData(): Promise<{
  wrote: Array<{ clientKey: string; keys: string[] }>
}> {
  const cfg = getTiaaS3Config()
  const bucket = cfg.bucket

  // Where the seed TS lives in S3.
  // You can override if you move it.
  const seedKey = process.env.TIAA_SEED_MOCK_TS_KEY || `${cfg.agent1.inputPrefix}mock-data.ts`

  const tsText = await s3GetText({ bucket, key: seedKey })
  if (!tsText || tsText.trim().length === 0) {
    throw new Error(`Seed source is empty: s3://${bucket}/${seedKey}`)
  }

  const exports = await parseExportedConstsFromTypeScriptSource(tsText)

  // Validate we have the expected exports.
  const requiredKeys: Array<keyof S3SeedExports> = [
    "clients",
    "carinaIPSData",
    "carinaRTQData",
    "carinaEstateData",
    "aiSuggestedActions",
    "meetingTopics",
    "johnSmithIPSData",
    "johnSmithRTQData",
    "johnSmithEstateData",
    "johnSmithAISuggestedActions",
    "johnSmithMeetingTopics",
  ]

  for (const k of requiredKeys) {
    if (!(k in exports)) {
      throw new Error(`Seed mock-data.ts missing required export: ${String(k)} (in s3://${bucket}/${seedKey})`)
    }
  }

  const seed = exports as unknown as S3SeedExports

  const wrote: Array<{ clientKey: string; keys: string[] }> = []

  const seedOne = async (clientKey: string, clientData: any, ipsData: any, rtqData: any, estateData: any, suggestions: any, topics: any) => {
    const keys: string[] = []

    const write = async (file: string, value: unknown) => {
      const key = keyFor(clientKey, file)
      await s3PutJson({ bucket, key, value })
      keys.push(key)
    }

    // Rewrite id to match folder key.
    const clientRecord = { ...clientData, id: clientKey }

    await write("client.json", clientRecord)
    await write("ips.json", ipsData)
    await write("rtq.json", rtqData)
    await write("estate.json", estateData)
    await write("profile-comparison.json", buildProfileComparison(ipsData, rtqData))
    await write("ai-suggestions.json", suggestions)
    await write("meeting-topics.json", topics)

    wrote.push({ clientKey, keys })
  }

  const carinaClient = findClientByKey(seed.clients, "carina")
  const johnClient = findClientByKey(seed.clients, "john")
  if (!carinaClient) throw new Error("Could not find Carina client record in S3 seed clients[]")
  if (!johnClient) throw new Error("Could not find John client record in S3 seed clients[]")

  await seedOne(
    "carina",
    carinaClient,
    seed.carinaIPSData,
    seed.carinaRTQData,
    seed.carinaEstateData,
    seed.aiSuggestedActions,
    seed.meetingTopics,
  )

  await seedOne(
    "john",
    johnClient,
    seed.johnSmithIPSData,
    seed.johnSmithRTQData,
    seed.johnSmithEstateData,
    seed.johnSmithAISuggestedActions,
    seed.johnSmithMeetingTopics,
  )

  return { wrote }
}

