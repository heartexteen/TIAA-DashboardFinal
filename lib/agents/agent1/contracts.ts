import { z } from "zod"

export type Agent1DocumentType = "ips" | "rtq" | "estate"

export const IPS_TEMPLATE = {
  clientProfile: {
    clientName: "",
    accounts: [] as Array<{
      accountName: string
      accountType: string
      approximateValue: number
      institution: string
      beneficiaryStatus: string
    }>,
    totalPortfolioValue: 0,
  },
  currentHoldings: {
    asOf: "",
    currency: "USD",
    accounts: [] as Array<{
      accountName: string
      accountType: string
      institution: string
      holdings: Array<{
        id?: string
        name: string
        ticker?: string
        market?: string
        assetClass: string
        instrumentType?: string
        currency?: string
        units?: number
        price?: number
        marketValue: number
        costBasis?: number
        unrealizedGain?: number
        yield?: number
        expenseRatio?: number
        durationYears?: number
        creditQuality?: string
        notes?: string
      }>
    }>,
  },
  investmentObjectives: [] as string[],
  riskTolerance: "",
  timeHorizon: "",
  liquidityNeeds: "",
  returnGoal: "",
  targetAssetAllocation: {
    portfolioProfile: "",
    allocations: [
      { assetClass: "Equity", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
      { assetClass: "Fixed Income", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
      { assetClass: "Alternatives", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
      { assetClass: "Cash & Equivalents", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
    ],
  },
  advisorNotes: [] as Array<{ title: string; content: string }>,
  benchmarks: [] as Array<{ assetClass: string; benchmark: string }>,
}

export const RTQ_TEMPLATE = {
  client: {
    name: "",
    document: "",
  },
  financialProfile: {
    assetsUnderConsideration: 0,
    employerStock: {
      company: "",
      approxValue: 0,
      note: "",
    },
    pensionIncome: {
      source: "",
      annualAmount: 0,
      note: "",
    },
    socialSecurity: {
      estimatedAnnual: 0,
      claimAge: 0,
      note: "",
    },
  },
  investmentPreferences: {
    timeHorizon: { selected: "", points: 0, note: "" },
    primaryInvestmentObjective: { selected: "", points: 0 },
    annualSpendingPolicy: { selected: "", points: 0, note: "" },
    returnExpectation: { selected: "", points: 0 },
    investmentApproach: { selected: "", points: 0 },
    reactionToLoss: { scenario: "", selected: "", points: 0 },
    mostFearedEvent: { selected: "", points: 0 },
    investmentKnowledge: { selected: "", points: 0 },
  },
  riskAssessment: {
    totalScore: 0,
    riskProfile: "",
    scoreRange: "",
    description: "",
  },
  suggestedAssetAllocation: {
    equity: 0,
    fixedIncome: 0,
    alternatives: 0,
    realAssets: 0,
    cash: 0,
  },
  investmentConstraints: {
    esgPreference: false,
    notes: [] as string[],
  },
}

export const ESTATE_TEMPLATE = {
  personalInformation: {
    name: "",
    age: 0,
    maritalStatus: "",
    spouse: {
      name: "",
      age: 0,
    },
    children: [] as Array<{ name: string; age: number; relationship: string }>,
    grandchildren: [] as Array<{ name: string; age: number }>,
    stateOfResidence: "",
  },
  powerOfAttorney: {
    primary: "",
    alternate: "",
    document: "",
  },
  healthcareDirective: {
    healthcareProxy: "",
    alternate: "",
    document: "",
  },
  beneficiaries: {
    qualified: "",
    primary: [] as Array<{ name: string; percentage: number; accounts: string[] }>,
    secondary: [] as Array<{ name: string; percentage: number; accounts: string[] }>,
  },
  taxExemption: "",
  assetsAndRecipients: [] as Array<{
    asset: string
    value: number
    recipient: string
    status: string
  }>,
  trusts: {
    revocableLivingTrust: {
      status: "",
      established: "",
      trustees: [] as string[],
      successorTrustee: "",
      beneficiaries: "",
      purpose: "",
      assets: "",
    },
    creditShelterTrust: {
      status: "",
    },
  },
  lifeInsurance: [] as Array<{
    type: string
    carrier: string
    faceValue: number
    beneficiary: string
    purpose: string
    note: string
  }>,
  charitableGiving: {
    intent: "",
    donorAdvisedFund: {
      status: "",
      note: "",
    },
    plannedGifts: [] as Array<{
      organization: string
      type: string
      amount: string
    }>,
  },
  trusteeDuties: [] as string[],
  documentsNeeded: [] as Array<{ document: string; priority: string; status: string }>,
  actionItems: [] as Array<{ id?: number; action: string; responsible: string; status: string }>,
}

export const DERIVED_INSIGHTS_SCHEMA = z.object({
  alerts: z
    .array(
      z.object({
        type: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        priority: z.string().min(1),
      }),
    )
    .max(6),
  aiSuggestions: z
    .array(
      z.object({
        priority: z.string().min(1),
        action: z.string().min(1),
        rationale: z.string().min(1),
        category: z.string().min(1),
      }),
    )
    .max(10),
  meetingTopics: z.array(z.string().min(1)).max(12),
})

export type DerivedInsights = z.infer<typeof DERIVED_INSIGHTS_SCHEMA>

export function templateForDocument(documentType: Agent1DocumentType) {
  if (documentType === "ips") return IPS_TEMPLATE
  if (documentType === "rtq") return RTQ_TEMPLATE
  return ESTATE_TEMPLATE
}

export function mergeWithTemplate<T>(template: T, value: unknown): T {
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return structuredClone(template)
    if (template.length === 0) return structuredClone(value) as T
    return value.map((item) => mergeWithTemplate(template[0], item)) as T
  }

  if (template && typeof template === "object") {
    const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
    const out: Record<string, unknown> = {}
    for (const [key, innerTemplate] of Object.entries(template as Record<string, unknown>)) {
      out[key] = mergeWithTemplate(innerTemplate, source[key])
    }
    return out as T
  }

  if (typeof template === "string") return (typeof value === "string" ? value : template) as T
  if (typeof template === "number") return (typeof value === "number" && Number.isFinite(value) ? value : template) as T
  if (typeof template === "boolean") return (typeof value === "boolean" ? value : template) as T
  return (value ?? template) as T
}
