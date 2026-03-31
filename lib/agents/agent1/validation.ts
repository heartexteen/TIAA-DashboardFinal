import type { ClientReferenceData } from "./reference-data/types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ValidationResult = {
  field: string
  severity: "error" | "warning" | "info"
  message: string
  action: "fallback" | "keep"
}

export type ValidationReport = {
  clientKey: string
  documentType: string
  results: ValidationResult[]
  usedFallback: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepClone<T>(value: T): T {
  return structuredClone(value)
}

function makeReport(clientKey: string, documentType: string): ValidationReport {
  return { clientKey, documentType, results: [], usedFallback: false }
}

function addResult(
  report: ValidationReport,
  field: string,
  severity: ValidationResult["severity"],
  message: string,
  action: ValidationResult["action"],
) {
  report.results.push({ field, severity, message, action })
  if (action === "fallback") {
    report.usedFallback = true
    console.warn(`[validation] FALLBACK ${report.documentType}/${field}: ${message}`)
  }
}

// ---------------------------------------------------------------------------
// IPS validation
// ---------------------------------------------------------------------------

export function validateIpsData(
  extracted: any,
  reference: ClientReferenceData["ips"],
): { patched: any; report: ValidationReport } {
  const patched = deepClone(extracted)
  const report = makeReport(reference.clientProfile?.clientName ?? "unknown", "ips")

  // -- totalPortfolioValue must be > 0 --
  if (!patched.clientProfile?.totalPortfolioValue || patched.clientProfile.totalPortfolioValue <= 0) {
    addResult(
      report,
      "clientProfile.totalPortfolioValue",
      "error",
      `Extracted value is ${patched.clientProfile?.totalPortfolioValue ?? 0}; using reference value ${reference.clientProfile.totalPortfolioValue}`,
      "fallback",
    )
    if (!patched.clientProfile) patched.clientProfile = {}
    patched.clientProfile.totalPortfolioValue = reference.clientProfile.totalPortfolioValue
  } else {
    addResult(report, "clientProfile.totalPortfolioValue", "info", "Value OK", "keep")
  }

  // -- accounts array must have at least 1 entry --
  const accounts = patched.clientProfile?.accounts
  if (!Array.isArray(accounts) || accounts.length === 0) {
    addResult(
      report,
      "clientProfile.accounts",
      "error",
      `Extracted accounts array is empty; using ${reference.clientProfile.accounts.length} reference accounts`,
      "fallback",
    )
    if (!patched.clientProfile) patched.clientProfile = {}
    patched.clientProfile.accounts = deepClone(reference.clientProfile.accounts)
  } else {
    // -- Each account.approximateValue must be > 0 --
    for (let i = 0; i < accounts.length; i++) {
      const acct = accounts[i]
      if (!acct.approximateValue || acct.approximateValue <= 0) {
        // Try to find a matching reference account by name
        const refAcct = reference.clientProfile.accounts.find(
          (r) => r.accountName === acct.accountName || r.accountType === acct.accountType,
        )
        if (refAcct && refAcct.approximateValue > 0) {
          addResult(
            report,
            `clientProfile.accounts[${i}].approximateValue`,
            "warning",
            `Account "${acct.accountName}" has value ${acct.approximateValue}; using reference value ${refAcct.approximateValue}`,
            "fallback",
          )
          accounts[i].approximateValue = refAcct.approximateValue
        } else {
          addResult(
            report,
            `clientProfile.accounts[${i}].approximateValue`,
            "warning",
            `Account "${acct.accountName}" has value ${acct.approximateValue} and no matching reference found`,
            "keep",
          )
        }
      }
    }
    addResult(report, "clientProfile.accounts", "info", `${accounts.length} account(s) present`, "keep")
  }

  // -- allocations should sum roughly to 100% --
  const allocations = patched.targetAssetAllocation?.allocations
  if (Array.isArray(allocations) && allocations.length > 0) {
    const sum = allocations.reduce(
      (acc: number, a: any) => acc + (typeof a.targetAllocation === "number" ? a.targetAllocation : 0),
      0,
    )
    if (sum < 90 || sum > 110) {
      addResult(
        report,
        "targetAssetAllocation.allocations",
        "warning",
        `Allocation sum is ${sum}%, which is outside the 90-110% tolerance; using reference allocations`,
        "fallback",
      )
      patched.targetAssetAllocation.allocations = deepClone(reference.targetAssetAllocation.allocations)
    } else {
      addResult(report, "targetAssetAllocation.allocations", "info", `Allocation sum is ${sum}%`, "keep")
    }
  } else if (reference.targetAssetAllocation?.allocations?.length) {
    addResult(
      report,
      "targetAssetAllocation.allocations",
      "warning",
      "No allocations extracted; using reference allocations",
      "fallback",
    )
    if (!patched.targetAssetAllocation) patched.targetAssetAllocation = {}
    patched.targetAssetAllocation.allocations = deepClone(reference.targetAssetAllocation.allocations)
  }

  // -- riskTolerance must be non-empty --
  if (!patched.riskTolerance || typeof patched.riskTolerance !== "string" || patched.riskTolerance.trim() === "") {
    addResult(
      report,
      "riskTolerance",
      "error",
      `Extracted riskTolerance is empty; using reference value "${reference.riskTolerance}"`,
      "fallback",
    )
    patched.riskTolerance = reference.riskTolerance
  } else {
    addResult(report, "riskTolerance", "info", "Value OK", "keep")
  }

  // -- timeHorizon must be non-empty --
  if (!patched.timeHorizon || typeof patched.timeHorizon !== "string" || patched.timeHorizon.trim() === "") {
    addResult(
      report,
      "timeHorizon",
      "error",
      `Extracted timeHorizon is empty; using reference value "${reference.timeHorizon}"`,
      "fallback",
    )
    patched.timeHorizon = reference.timeHorizon
  } else {
    addResult(report, "timeHorizon", "info", "Value OK", "keep")
  }

  return { patched, report }
}

// ---------------------------------------------------------------------------
// RTQ validation
// ---------------------------------------------------------------------------

export function validateRtqData(
  extracted: any,
  reference: ClientReferenceData["rtq"],
): { patched: any; report: ValidationReport } {
  const patched = deepClone(extracted)
  const report = makeReport(reference.client?.name ?? "unknown", "rtq")

  // -- riskAssessment.totalScore must be > 0 --
  if (!patched.riskAssessment?.totalScore || patched.riskAssessment.totalScore <= 0) {
    addResult(
      report,
      "riskAssessment.totalScore",
      "error",
      `Extracted totalScore is ${patched.riskAssessment?.totalScore ?? 0}; using reference value ${reference.riskAssessment.totalScore}`,
      "fallback",
    )
    if (!patched.riskAssessment) patched.riskAssessment = {}
    patched.riskAssessment.totalScore = reference.riskAssessment.totalScore
  } else {
    addResult(report, "riskAssessment.totalScore", "info", "Value OK", "keep")
  }

  // -- riskAssessment.riskProfile must be non-empty --
  if (
    !patched.riskAssessment?.riskProfile ||
    typeof patched.riskAssessment.riskProfile !== "string" ||
    patched.riskAssessment.riskProfile.trim() === ""
  ) {
    addResult(
      report,
      "riskAssessment.riskProfile",
      "error",
      `Extracted riskProfile is empty; using reference value "${reference.riskAssessment.riskProfile}"`,
      "fallback",
    )
    if (!patched.riskAssessment) patched.riskAssessment = {}
    patched.riskAssessment.riskProfile = reference.riskAssessment.riskProfile
  } else {
    addResult(report, "riskAssessment.riskProfile", "info", "Value OK", "keep")
  }

  // -- suggestedAssetAllocation equity + fixedIncome must be > 0 --
  const equity = patched.suggestedAssetAllocation?.equity ?? 0
  const fixedIncome = patched.suggestedAssetAllocation?.fixedIncome ?? 0
  if (equity + fixedIncome <= 0) {
    addResult(
      report,
      "suggestedAssetAllocation",
      "error",
      `equity (${equity}) + fixedIncome (${fixedIncome}) = ${equity + fixedIncome}; using reference allocation`,
      "fallback",
    )
    patched.suggestedAssetAllocation = deepClone(reference.suggestedAssetAllocation)
  } else {
    addResult(
      report,
      "suggestedAssetAllocation",
      "info",
      `equity (${equity}) + fixedIncome (${fixedIncome}) = ${equity + fixedIncome}`,
      "keep",
    )
  }

  return { patched, report }
}

// ---------------------------------------------------------------------------
// Estate validation  (CRITICAL - fixes the $0 bug)
// ---------------------------------------------------------------------------

const ESTATE_VALUE_SANITY_FLOOR = 100_000

export function validateEstateData(
  extracted: any,
  reference: ClientReferenceData["estate"],
): { patched: any; report: ValidationReport } {
  const patched = deepClone(extracted)
  const report = makeReport(reference.personalInformation?.name ?? "unknown", "estate")

  // -- assetsAndRecipients array must have at least 1 entry --
  const assets: any[] | undefined = patched.assetsAndRecipients
  if (!Array.isArray(assets) || assets.length === 0) {
    addResult(
      report,
      "assetsAndRecipients",
      "error",
      `Extracted assetsAndRecipients is empty; using ALL ${reference.assetsAndRecipients.length} reference assets`,
      "fallback",
    )
    patched.assetsAndRecipients = deepClone(reference.assetsAndRecipients)
  } else {
    // -- Each asset.value must be > 0 --
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i]
      if (!item.value || item.value <= 0) {
        // Try to find a matching reference asset by name
        const refAsset = reference.assetsAndRecipients.find(
          (r) => r.asset.toLowerCase() === (item.asset ?? "").toLowerCase(),
        )
        if (refAsset && refAsset.value > 0) {
          addResult(
            report,
            `assetsAndRecipients[${i}].value`,
            "error",
            `Asset "${item.asset}" has value $${item.value ?? 0}; using reference value $${refAsset.value}`,
            "fallback",
          )
          assets[i].value = refAsset.value
        } else {
          addResult(
            report,
            `assetsAndRecipients[${i}].value`,
            "warning",
            `Asset "${item.asset}" has value $${item.value ?? 0} and no matching reference found`,
            "keep",
          )
        }
      }
    }

    // -- Total estate value must be > $100K (sanity floor) --
    const totalValue = assets.reduce(
      (acc: number, item: any) => acc + (typeof item.value === "number" ? item.value : 0),
      0,
    )
    if (totalValue < ESTATE_VALUE_SANITY_FLOOR) {
      addResult(
        report,
        "assetsAndRecipients (total)",
        "error",
        `Total estate value $${totalValue.toLocaleString()} is below sanity floor $${ESTATE_VALUE_SANITY_FLOOR.toLocaleString()}; replacing with ALL reference data`,
        "fallback",
      )
      patched.assetsAndRecipients = deepClone(reference.assetsAndRecipients)
    } else {
      addResult(
        report,
        "assetsAndRecipients (total)",
        "info",
        `Total estate value $${totalValue.toLocaleString()} passes sanity floor`,
        "keep",
      )
    }
  }

  return { patched, report }
}
