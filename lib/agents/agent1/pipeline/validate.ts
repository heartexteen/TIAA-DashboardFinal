import { referenceData } from "../reference-data"
import { validateIpsData, validateRtqData, validateEstateData, type ValidationReport } from "../validation"
import type { Agent1PipelineState } from "./types"

// ---------------------------------------------------------------------------
// Node: validate
// ---------------------------------------------------------------------------

export async function validateNode(
  state: Agent1PipelineState,
): Promise<Partial<Agent1PipelineState>> {
  const clientKey = state.clientKey
  if (!clientKey) throw new Error("validateNode: clientKey is not set on state.")

  const ref = referenceData[clientKey]
  if (!ref) throw new Error(`validateNode: no referenceData for client "${clientKey}".`)

  const reports: ValidationReport[] = []
  let ipsData = state.rawIpsData as any
  let rtqData = state.rawRtqData as any
  let estateData = state.rawEstateData as any

  // Validate IPS
  if (ipsData) {
    const result = validateIpsData(ipsData, ref.ips)
    ipsData = result.patched
    reports.push(result.report)
  } else {
    reports.push({
      clientKey,
      documentType: "ips",
      results: [
        {
          field: "(entire document)",
          severity: "error",
          message: "IPS extraction returned no data; skipping validation.",
          action: "keep",
        },
      ],
      usedFallback: false,
    })
  }

  // Validate RTQ
  if (rtqData) {
    const result = validateRtqData(rtqData, ref.rtq)
    rtqData = result.patched
    reports.push(result.report)
  } else {
    reports.push({
      clientKey,
      documentType: "rtq",
      results: [
        {
          field: "(entire document)",
          severity: "error",
          message: "RTQ extraction returned no data; skipping validation.",
          action: "keep",
        },
      ],
      usedFallback: false,
    })
  }

  // Validate Estate
  if (estateData) {
    const result = validateEstateData(estateData, ref.estate)
    estateData = result.patched
    reports.push(result.report)
  } else {
    reports.push({
      clientKey,
      documentType: "estate",
      results: [
        {
          field: "(entire document)",
          severity: "error",
          message: "Estate extraction returned no data; skipping validation.",
          action: "keep",
        },
      ],
      usedFallback: false,
    })
  }

  return {
    ipsData: ipsData ?? state.rawIpsData,
    rtqData: rtqData ?? state.rawRtqData,
    estateData: estateData ?? state.rawEstateData,
    validationReports: reports,
  }
}
