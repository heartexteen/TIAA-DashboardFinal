// Mock data for TIAA Wealth Advisor CRM Dashboard
// Based on Carina Voss client documents

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  advisor: string
  status: "active" | "pending" | "inactive"
  totalAssets: number
  lastMeeting: string
  nextMeeting: string
  documents: Document[]
  alerts: Alert[]
}

export interface Document {
  id: string
  name: string
  type: "IPS" | "RTQ" | "Estate" | "Tax" | "Other"
  uploadedAt: string
  status: "processed" | "processing" | "pending"
  extractedData?: Record<string, unknown>
  pdfPath?: string
}

export interface Alert {
  id: string
  type: "mismatch" | "action_required" | "info" | "warning"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  createdAt: string
}

export interface Account {
  accountName: string
  accountType: "Tax-Deferred" | "Tax-Free" | "Taxable"
  approximateValue: number
  institution: string
  beneficiaryStatus: "complete" | "incomplete" | "pending"
}

export interface AssetAllocation {
  assetClass: string
  targetAllocation: number
  currentAllocation?: number
  allowableMin: number
  allowableMax: number
}

export interface RiskProfile {
  source: string
  riskTolerance: string
  score?: number
  scoreRange?: string
  timeHorizon: string
  returnExpectation: string
  primaryObjective: string
}

export interface EstateItem {
  asset: string
  value: number
  recipient: string
  status: "complete" | "pending" | "action_required"
}

// Carina Voss IPS Data
export const carinaIPSData = {
  clientProfile: {
    clientName: "Carina Voss",
    accounts: [
      {
        accountName: "Carina – Fidelity Traditional IRA",
        accountType: "Tax-Deferred" as const,
        approximateValue: 480000,
        institution: "Fidelity",
        beneficiaryStatus: "incomplete" as const,
      },
      {
        accountName: "Carina – Fidelity ROTH IRA",
        accountType: "Tax-Free" as const,
        approximateValue: 220000,
        institution: "Fidelity",
        beneficiaryStatus: "incomplete" as const,
      },
      {
        accountName: "Carina – Individual Brokerage",
        accountType: "Taxable" as const,
        approximateValue: 500000,
        institution: "Fidelity",
        beneficiaryStatus: "incomplete" as const,
      },
    ],
    totalPortfolioValue: 1200000,
  },
  investmentObjectives: [
    "Capital Preservation",
    "Income",
    "Growth and Income",
    "Growth",
    "Gifting / Legacy Goals",
  ],
  riskTolerance: "Moderately Aggressive",
  timeHorizon: "20+ Years",
  liquidityNeeds:
    "Carina does not anticipate near-term distributions from this portfolio. A minimal cash reserve will be maintained. No regular withdrawal schedule is anticipated at this time.",
  returnGoal:
    "Given the client's risk tolerance, the Advisor will seek the best possible returns at an appropriate level of risk, targeting an annualized net return of 7–9% over a full market cycle.",
  targetAssetAllocation: {
    portfolioProfile: "Moderately Aggressive",
    allocations: [
      { assetClass: "Equity", targetAllocation: 75, allowableMin: 65, allowableMax: 85 },
      { assetClass: "Fixed Income", targetAllocation: 15, allowableMin: 10, allowableMax: 25 },
      { assetClass: "Alternatives", targetAllocation: 8, allowableMin: 0, allowableMax: 15 },
      { assetClass: "Cash & Equivalents", targetAllocation: 2, allowableMin: 0, allowableMax: 5 },
    ],
  },
  advisorNotes: [
    {
      title: "Concentrated Stock Position",
      content:
        "Carina holds approximately $85,000 in employer stock (Acme Technologies). This position will be treated as a Domestic Large Cap equivalent in the allocation model. Diversification will be pursued opportunistically in light of her tax situation.",
    },
    {
      title: "ESG Preference",
      content:
        "Carina has expressed a preference for ESG-conscious fund selection where available at competitive expense ratios and performance characteristics.",
    },
    {
      title: "Upcoming Liquidity Events",
      content:
        "No significant near-term liquidity needs identified. Portfolio is structured for long-term growth consistent with a 20+ year horizon and Moderately Aggressive risk profile.",
    },
  ],
  benchmarks: [
    { assetClass: "Fixed Income", benchmark: "Bloomberg U.S. Aggregate Bond Index" },
    { assetClass: "Equities", benchmark: "MSCI ACWI Index" },
    { assetClass: "Alternatives", benchmark: "50% MSCI World REITs / 50% Bloomberg Commodity Index" },
  ],
}

// Carina Voss RTQ Data
export const carinaRTQData = {
  client: {
    name: "Carina Voss",
    document: "Raymond James Institutional Risk Tolerance Assessment",
  },
  financialProfile: {
    assetsUnderConsideration: 1200000,
    employerStock: {
      company: "Acme Technologies",
      approxValue: 85000,
      note: "Concentrated employer stock position to be considered in equity allocation",
    },
  },
  investmentPreferences: {
    timeHorizon: {
      selected: "5–10 Years",
      points: 6,
      note: "Client may retire early and anticipates needing portfolio income within 7–8 years",
    },
    primaryInvestmentObjective: {
      selected: "Income",
      points: 3,
    },
    annualSpendingPolicy: {
      selected: "Moderate (2–5%)",
      points: 6,
    },
    returnExpectation: {
      selected: "3–5%",
      points: 6,
    },
    investmentApproach: {
      selected:
        "Prefers to slightly increase investment value while minimizing the potential for loss of principal",
      points: 6,
    },
    reactionToLoss: {
      scenario: "Portfolio loses 20% in first year",
      selected: "Concerned and consider liquidating the investment",
      points: 6,
    },
    mostFearedEvent: {
      selected: "Loss of 10% of principal within six months",
      points: 3,
    },
    investmentKnowledge: {
      selected: "Moderate — Some investment experience",
      points: 9,
    },
  },
  riskAssessment: {
    totalScore: 45,
    riskProfile: "Moderate Conservative",
    scoreRange: "38–51",
    description:
      "Portfolio designed to balance growth and income with moderate sensitivity to market fluctuations.",
  },
  suggestedAssetAllocation: {
    equity: 40,
    fixedIncome: 50,
    alternatives: 7,
    cash: 3,
  },
  investmentConstraints: {
    esgPreference: true,
    notes: [
      "Client prefers ESG-aligned investments when possible.",
      "Employer stock concentration should be considered when evaluating domestic equity exposure.",
    ],
  },
}

// Carina Voss Estate Data
export const carinaEstateData = {
  personalInformation: {
    name: "Carina Voss",
    maritalStatus: "Single",
    children: [],
    stateOfResidence: "Maine",
  },
  powerOfAttorney: {
    primary: "To Be Named by Client",
    alternate: "To Be Named by Client",
  },
  beneficiaries: {
    qualified: "To be determined — no beneficiaries identified",
    primary: [],
    secondary: [],
  },
  taxExemption:
    "Federal estate tax exemption (2026): $15,000,000. Carina's estate (~$1.2M) is well below this threshold; no federal estate tax concern currently.",
  assetsAndRecipients: [
    {
      asset: "Fidelity Traditional IRA",
      value: 480000,
      recipient: "To be determined (beneficiary designation required)",
      status: "action_required" as const,
    },
    {
      asset: "Fidelity ROTH IRA",
      value: 220000,
      recipient: "To be determined (beneficiary designation required)",
      status: "action_required" as const,
    },
    {
      asset: "Individual Brokerage Account",
      value: 500000,
      recipient: "To be determined (TOD beneficiary or via will)",
      status: "action_required" as const,
    },
    {
      asset: "Acme Technologies Employer Stock",
      value: 85000,
      recipient: "To be determined",
      status: "pending" as const,
    },
  ],
  trusteeDuties: [
    "Manage and safeguard trust assets on behalf of beneficiaries.",
    "Follow instructions outlined in the trust document.",
    "Make distributions to beneficiaries according to trust terms.",
    "Maintain records and provide financial reporting for trust activities.",
    "Act in the best fiduciary interest of the beneficiaries.",
    "Coordinate with advisors and professionals (legal, tax, investment) when managing trust assets.",
  ],
  documentsNeeded: [
    { document: "Last Will and Testament", priority: "High", status: "pending" },
    { document: "Revocable Living Trust", priority: "High", status: "pending" },
    { document: "Advance Medical Directive (Living Will)", priority: "High", status: "pending" },
    { document: "Durable General POA (Financial)", priority: "High", status: "pending" },
    { document: "IRA Beneficiary Designations", priority: "High", status: "pending" },
    { document: "TOD Designation (Brokerage)", priority: "Medium", status: "pending" },
    { document: "HIPAA Authorization", priority: "Medium", status: "pending" },
    { document: "Concentrated Stock Exit Strategy", priority: "Medium", status: "pending" },
  ],
  actionItems: [
    {
      id: 1,
      action: "Reconcile IPS (Moderately Aggressive) vs. RTQ (Moderately Conservative) risk profile",
      responsible: "Carina + PFA Advisor",
      status: "Pending",
    },
    {
      id: 2,
      action: "Identify and confirm executor, POA agent, and health care agent",
      responsible: "Carina",
      status: "Pending",
    },
    {
      id: 3,
      action: "Update IRA beneficiary designations with Fidelity",
      responsible: "Carina",
      status: "Pending",
    },
    {
      id: 4,
      action: "Add TOD designation to individual brokerage account",
      responsible: "Carina + Fidelity",
      status: "Pending",
    },
    {
      id: 5,
      action: "Clarify charitable/legacy gifting goals and identify specific organizations",
      responsible: "Carina",
      status: "Pending",
    },
    {
      id: 6,
      action: "Discuss Revocable Living Trust structure with estate attorney",
      responsible: "Carina + Attorney",
      status: "Pending",
    },
    {
      id: 7,
      action: "Review Acme Technologies stock exit / diversification plan with PFA",
      responsible: "Carina + PFA",
      status: "Pending",
    },
    {
      id: 8,
      action: "Sign Will, AMD, POA, and Living Trust documents",
      responsible: "Carina + Witnesses + Notary",
      status: "Scheduled",
    },
  ],
}

// Profile Comparison Data (IPS vs RTQ discrepancies)
export const profileComparisonData = [
  {
    category: "Risk Tolerance",
    ipsValue: "Moderately Aggressive",
    rtqValue: "Moderately Conservative (Score: 45)",
    status: "mismatch" as const,
    note: "Significant discrepancy — warrants advisor review",
  },
  {
    category: "Time Horizon",
    ipsValue: "20+ Years",
    rtqValue: "5–10 Years (early retirement)",
    status: "mismatch" as const,
    note: "Discrepancy — Carina may retire in 7–8 yrs",
  },
  {
    category: "Return Target",
    ipsValue: "7–9% annualized (net)",
    rtqValue: "3–5% expected by client",
    status: "mismatch" as const,
    note: "Discrepancy — expectation gap to address",
  },
  {
    category: "Primary Objective",
    ipsValue: "Growth + Income + Legacy",
    rtqValue: "Income",
    status: "warning" as const,
    note: "Partially aligned",
  },
  {
    category: "Equity Allocation",
    ipsValue: "75%",
    rtqValue: "40%",
    status: "mismatch" as const,
    note: "Significant divergence — review needed",
  },
  {
    category: "Fixed Income Allocation",
    ipsValue: "15%",
    rtqValue: "50%",
    status: "mismatch" as const,
    note: "Significant divergence — review needed",
  },
  {
    category: "ESG Preference",
    ipsValue: "Yes (where available)",
    rtqValue: "Yes (noted as constraint)",
    status: "aligned" as const,
    note: "Aligned",
  },
  {
    category: "Concentrated Stock",
    ipsValue: "~$85K Acme Technologies",
    rtqValue: "~$85K (noted as constraint)",
    status: "aligned" as const,
    note: "Aligned — diversify opportunistically",
  },
]

// Client List with multiple example clients
export const clients: Client[] = [
  {
    id: "carina-voss",
    name: "Carina Voss",
    email: "carina.voss@email.com",
    phone: "(207) 555-0123",
    advisor: "Penobscot Financial Advisors",
    status: "active",
    totalAssets: 1200000,
    lastMeeting: "2025-02-15",
    nextMeeting: "2025-04-20",
    documents: [
      {
        id: "ips-001",
        name: "Investment Policy Statement",
        type: "IPS",
        uploadedAt: "2024-03-15",
        status: "processed",
        pdfPath: "/documents/Carina_IPS.pdf",
      },
      {
        id: "rtq-001",
        name: "Risk Tolerance Questionnaire",
        type: "RTQ",
        uploadedAt: "2024-03-10",
        status: "processed",
        pdfPath: "/documents/Carina_RTQ.pdf",
      },
      {
        id: "estate-001",
        name: "Estate Planning Worksheet",
        type: "Estate",
        uploadedAt: "2024-03-20",
        status: "processed",
        pdfPath: "/documents/Carina_Estate.pdf",
      },
    ],
    alerts: [
      {
        id: "alert-001",
        type: "mismatch",
        title: "Risk Profile Mismatch",
        description: "IPS (Moderately Aggressive) differs from RTQ (Moderately Conservative)",
        priority: "high",
        createdAt: "2025-03-01",
      },
      {
        id: "alert-002",
        type: "action_required",
        title: "Beneficiary Designations Incomplete",
        description: "IRA and brokerage accounts require beneficiary designations",
        priority: "high",
        createdAt: "2025-03-01",
      },
      {
        id: "alert-003",
        type: "warning",
        title: "Concentrated Stock Position",
        description: "$85K in Acme Technologies employer stock requires diversification plan",
        priority: "medium",
        createdAt: "2025-03-01",
      },
    ],
  },
  {
    id: "john-smith",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(207) 555-0456",
    advisor: "Penobscot Financial Advisors",
    status: "active",
    totalAssets: 2500000,
    lastMeeting: "2025-03-01",
    nextMeeting: "2025-05-15",
    documents: [
      {
        id: "ips-002",
        name: "Investment Policy Statement",
        type: "IPS",
        uploadedAt: "2024-01-20",
        status: "processed",
        pdfPath: "/documents/JohnSmith_IPS.pdf",
      },
      {
        id: "rtq-002",
        name: "TIAA Risk Tolerance Assessment",
        type: "RTQ",
        uploadedAt: "2024-01-15",
        status: "processed",
        pdfPath: "/documents/JohnSmith_RTQ.pdf",
      },
      {
        id: "estate-002",
        name: "Estate Planning Documents",
        type: "Estate",
        uploadedAt: "2023-06-20",
        status: "processed",
        pdfPath: "/documents/JohnSmith_Estate.pdf",
      },
      {
        id: "tax-001",
        name: "2024 Tax Planning Memo",
        type: "Tax",
        uploadedAt: "2025-02-01",
        status: "processed",
        pdfPath: "/documents/JohnSmith_Tax_2024.pdf",
      },
    ],
    alerts: [
      {
        id: "alert-js-001",
        type: "action_required",
        title: "Roth Conversion Window Opening Soon",
        description:
          "Optimal time to begin Roth conversions starts in 3 years at retirement. Planning should begin now.",
        priority: "high",
        createdAt: "2025-03-12",
      },
      {
        id: "alert-js-002",
        type: "action_required",
        title: "Complete Living Trust Asset Transfer",
        description:
          "Primary residence and joint brokerage account should be titled to Revocable Living Trust.",
        priority: "high",
        createdAt: "2025-03-10",
      },
      {
        id: "alert-js-003",
        type: "warning",
        title: "Tax-Loss Harvesting Opportunity",
        description:
          "Joint brokerage account has ~$30k in unrealized losses that should be harvested before year-end.",
        priority: "medium",
        createdAt: "2025-03-08",
      },
    ],
  },
  // {
  //   id: "maria-garcia",
  //   name: "Maria Garcia",
  //   email: "maria.garcia@email.com",
  //   phone: "(207) 555-0789",
  //   advisor: "Penobscot Financial Advisors",
  //   status: "pending",
  //   totalAssets: 850000,
  //   lastMeeting: "2025-01-10",
  //   nextMeeting: "2025-04-05",
  //   documents: [
  //     {
  //       id: "rtq-003",
  //       name: "Risk Tolerance Questionnaire",
  //       type: "RTQ",
  //       uploadedAt: "2025-01-10",
  //       status: "processing",
  //     },
  //   ],
  //   alerts: [
  //     {
  //       id: "alert-004",
  //       type: "info",
  //       title: "Documents Processing",
  //       description: "RTQ document is being analyzed",
  //       priority: "low",
  //       createdAt: "2025-03-10",
  //     },
  //   ],
  // },
]

// AI Suggested Actions for Carina
export const aiSuggestedActions = [
  {
    id: 1,
    priority: "high",
    action: "Discuss the mismatch between IPS (Moderately Aggressive) and RTQ (Moderately Conservative)",
    rationale:
      "The documents show a significant divergence in risk tolerance assessment. The IPS targets 75% equity while the RTQ suggests 40% equity would be more appropriate.",
    category: "Risk Assessment",
  },
  {
    id: 2,
    priority: "high",
    action: "Review diversification strategy for concentrated employer stock ($85k in Acme Technologies)",
    rationale:
      "Concentrated position represents ~7% of portfolio. Tax-efficient diversification strategies should be discussed.",
    category: "Portfolio Management",
  },
  {
    id: 3,
    priority: "high",
    action: "Clarify retirement timeline (7–8 years) vs IPS 20+ year horizon",
    rationale:
      "RTQ indicates early retirement plans within 7-8 years, but IPS assumes 20+ year horizon. This needs reconciliation.",
    category: "Financial Planning",
  },
  {
    id: 4,
    priority: "medium",
    action: "Update beneficiary designations on all accounts",
    rationale:
      "All three accounts (Traditional IRA, ROTH IRA, Brokerage) lack beneficiary designations. This is critical for estate planning.",
    category: "Estate Planning",
  },
  {
    id: 5,
    priority: "medium",
    action: "Discuss establishing a Revocable Living Trust",
    rationale:
      "Given the $1.2M portfolio size, a living trust would help avoid probate and facilitate smooth asset transfer.",
    category: "Estate Planning",
  },
  {
    id: 6,
    priority: "medium",
    action: "Review ESG investment options aligned with client preferences",
    rationale:
      "Both documents note ESG preference. Ensure current holdings align with ESG criteria where performance is competitive.",
    category: "Investment Selection",
  },
  {
    id: 7,
    priority: "low",
    action: "Schedule follow-up meeting to finalize estate planning documents",
    rationale: "Multiple estate documents (Will, Living Trust, POA, AMD) are pending execution.",
    category: "Administrative",
  },
]

// Meeting Topics for Carina
export const meetingTopics = [
  "Risk profile reconciliation (IPS vs RTQ)",
  "Retirement timeline clarification",
  "Acme Technologies stock diversification plan",
  "Beneficiary designation updates",
  "Estate planning document execution",
  "ESG investment review",
  "Return expectations alignment",
]

// ==================== JOHN SMITH DATA ====================

// John Smith IPS Data
export const johnSmithIPSData = {
  clientProfile: {
    clientName: "John Smith",
    accounts: [
      {
        accountName: "John Smith – TIAA Traditional 403(b)",
        accountType: "Tax-Deferred" as const,
        approximateValue: 1200000,
        institution: "TIAA",
        beneficiaryStatus: "complete" as const,
      },
      {
        accountName: "John Smith – TIAA Roth 403(b)",
        accountType: "Tax-Free" as const,
        approximateValue: 350000,
        institution: "TIAA",
        beneficiaryStatus: "complete" as const,
      },
      {
        accountName: "John & Sarah Smith Joint Brokerage",
        accountType: "Taxable" as const,
        approximateValue: 650000,
        institution: "Vanguard",
        beneficiaryStatus: "complete" as const,
      },
      {
        accountName: "John Smith – Rollover IRA",
        accountType: "Tax-Deferred" as const,
        approximateValue: 300000,
        institution: "Vanguard",
        beneficiaryStatus: "complete" as const,
      },
    ],
    totalPortfolioValue: 2500000,
  },
  investmentObjectives: [
    "Capital Preservation",
    "Income Generation",
    "Inflation Protection",
    "Estate Planning / Legacy",
  ],
  riskTolerance: "Moderate",
  timeHorizon: "10-15 Years",
  liquidityNeeds:
    "John plans to retire in 3 years (age 65) and will begin Required Minimum Distributions (RMDs) from tax-deferred accounts at age 73. Portfolio should support annual distributions of approximately $100,000-$120,000 in retirement. Emergency reserve of $50,000 will be maintained in money market funds.",
  returnGoal:
    "Target annualized net return of 5–7% over a full market cycle, balancing growth needs with capital preservation as client approaches retirement. Focus on total return (growth + income) with gradual shift toward income-producing assets.",
  targetAssetAllocation: {
    portfolioProfile: "Moderate",
    allocations: [
      { assetClass: "Equity", targetAllocation: 55, allowableMin: 45, allowableMax: 65 },
      { assetClass: "Fixed Income", targetAllocation: 35, allowableMin: 25, allowableMax: 45 },
      { assetClass: "Real Assets", targetAllocation: 8, allowableMin: 3, allowableMax: 12 },
      { assetClass: "Cash & Equivalents", targetAllocation: 2, allowableMin: 0, allowableMax: 5 },
    ],
  },
  advisorNotes: [
    {
      title: "Retirement Timeline",
      content:
        "John plans to retire at age 65 (in 3 years) from his position as a university professor. He and his wife Sarah (age 63, retired teacher) plan to relocate to coastal Maine. Portfolio should transition gradually toward income generation while maintaining moderate growth exposure.",
    },
    {
      title: "Pension Income",
      content:
        "John will receive $45,000/year from university pension starting at age 65. Sarah receives $32,000/year from teacher's pension. Combined Social Security benefits estimated at $58,000/year starting at age 67 (delayed claiming strategy). Total fixed income: ~$135,000/year in retirement.",
    },
    {
      title: "Tax-Loss Harvesting Opportunity",
      content:
        "Joint brokerage account holds several positions with unrealized losses from 2022 market downturn. Tax-loss harvesting strategy should be implemented over next 2-3 years to offset future capital gains and generate tax alpha.",
    },
    {
      title: "RMD Planning",
      content:
        "Traditional 403(b) and Rollover IRA will trigger RMDs at age 73. Combined RMD projected at ~$70,000/year initially. Roth conversion ladder strategy should be evaluated during 65-73 age window to manage future tax liability.",
    },
  ],
  benchmarks: [
    { assetClass: "Fixed Income", benchmark: "Bloomberg U.S. Aggregate Bond Index" },
    { assetClass: "Equities", benchmark: "60% S&P 500 / 40% MSCI ACWI ex-US" },
    { assetClass: "Real Assets", benchmark: "Bloomberg Commodity Index" },
  ],
  currentHoldings: {
    equity: 58,
    fixedIncome: 32,
    realAssets: 7,
    cash: 3,
  },
  rebalancingPolicy: {
    frequency: "Quarterly review, rebalance when allocation drifts beyond allowable ranges",
    taxConsideration: "Prioritize rebalancing in tax-advantaged accounts to minimize tax impact",
  },
}

// John Smith RTQ Data
export const johnSmithRTQData = {
  client: {
    name: "John Smith",
    document: "TIAA Wealth Management Risk Tolerance Assessment",
  },
  financialProfile: {
    assetsUnderConsideration: 2500000,
    pensionIncome: {
      source: "University Pension + Teacher Pension (spouse)",
      annualAmount: 77000,
      note: "Combined pension income provides stable base; portfolio can maintain moderate equity exposure",
    },
    socialSecurity: {
      estimatedAnnual: 58000,
      claimAge: 67,
      note: "Delayed claiming to age 67 for higher benefits",
    },
  },
  investmentPreferences: {
    timeHorizon: {
      selected: "10–15 Years",
      points: 7,
      note: "Planning for 20+ year retirement, but gradual transition to income focus over next 3 years",
    },
    primaryInvestmentObjective: {
      selected: "Balanced Growth and Income",
      points: 5,
    },
    annualSpendingPolicy: {
      selected: "Moderate (4–5%)",
      points: 5,
      note: "Plan to withdraw $100k-$120k annually from portfolio in retirement",
    },
    returnExpectation: {
      selected: "5–7%",
      points: 7,
    },
    investmentApproach: {
      selected:
        "Willing to accept moderate fluctuations in pursuit of long-term growth, but prefer to avoid significant losses",
      points: 7,
    },
    reactionToLoss: {
      scenario: "Portfolio loses 15% in first year of retirement",
      selected: "Stay the course if fundamentals are sound, but review allocation",
      points: 7,
    },
    mostFearedEvent: {
      selected: "Prolonged market downturn in early retirement (sequence of returns risk)",
      points: 5,
    },
    investmentKnowledge: {
      selected: "High — Extensive investment experience, follows markets closely",
      points: 12,
    },
  },
  riskAssessment: {
    totalScore: 55,
    riskProfile: "Moderate",
    scoreRange: "52–67",
    description:
      "Portfolio designed to balance growth and income with moderate sensitivity to market volatility. Appropriate for pre-retiree seeking steady returns with manageable risk.",
  },
  suggestedAssetAllocation: {
    equity: 55,
    fixedIncome: 35,
    alternatives: 8,
    cash: 2,
  },
  investmentConstraints: {
    esgPreference: false,
    notes: [
      "Client prioritizes tax efficiency given high tax-deferred account balances",
      "Inflation protection important given long retirement horizon",
      "Prefers low-cost index funds and ETFs where appropriate",
    ],
  },
}

// John Smith Estate Data
export const johnSmithEstateData = {
  personalInformation: {
    name: "John Smith",
    age: 62,
    maritalStatus: "Married",
    spouse: {
      name: "Sarah Smith",
      age: 63,
    },
    children: [
      { name: "Emily Smith", age: 35, relationship: "Daughter" },
      { name: "Michael Smith", age: 32, relationship: "Son" },
    ],
    grandchildren: [
      { name: "Olivia Smith", age: 8 },
      { name: "Ethan Smith", age: 5 },
    ],
    stateOfResidence: "Pennsylvania (planning to relocate to Maine upon retirement)",
  },
  powerOfAttorney: {
    primary: "Sarah Smith (Spouse)",
    alternate: "Emily Smith (Daughter)",
    document: "Durable Power of Attorney executed 2023",
  },
  healthcareDirective: {
    healthcareProxy: "Sarah Smith",
    alternate: "Emily Smith",
    document: "Healthcare Power of Attorney and Living Will executed 2023",
  },
  beneficiaries: {
    qualified: "All retirement accounts have designated beneficiaries",
    primary: [
      { name: "Sarah Smith", percentage: 100, accounts: ["403(b)", "Roth 403(b)", "Rollover IRA"] },
    ],
    secondary: [
      { name: "Emily Smith", percentage: 50, accounts: ["All qualified accounts"] },
      { name: "Michael Smith", percentage: 50, accounts: ["All qualified accounts"] },
    ],
  },
  taxExemption:
    "Federal estate tax exemption (2026): $15,000,000 per individual, $30,000,000 for married couple. John and Sarah's combined estate (~$3.2M including home) is well below exemption; no federal estate tax concern. Pennsylvania inheritance tax may apply (3.5% for children).",
  assetsAndRecipients: [
    {
      asset: "TIAA Traditional 403(b)",
      value: 1200000,
      recipient: "Primary: Sarah Smith; Secondary: 50% Emily, 50% Michael",
      status: "complete" as const,
    },
    {
      asset: "TIAA Roth 403(b)",
      value: 350000,
      recipient: "Primary: Sarah Smith; Secondary: 50% Emily, 50% Michael",
      status: "complete" as const,
    },
    {
      asset: "Vanguard Rollover IRA",
      value: 300000,
      recipient: "Primary: Sarah Smith; Secondary: 50% Emily, 50% Michael",
      status: "complete" as const,
    },
    {
      asset: "Vanguard Joint Brokerage (JTWROS)",
      value: 650000,
      recipient: "Joint with Right of Survivorship with Sarah Smith",
      status: "complete" as const,
    },
    {
      asset: "Primary Residence",
      value: 650000,
      recipient: "Joint ownership with Sarah; passes to children via will",
      status: "complete" as const,
    },
    {
      asset: "529 College Savings Plans (grandchildren)",
      value: 80000,
      recipient: "Olivia Smith ($40k), Ethan Smith ($40k)",
      status: "complete" as const,
    },
  ],
  trusts: {
    revocableLivingTrust: {
      status: "Established",
      established: "2023-06-15",
      trustees: ["John Smith", "Sarah Smith (Co-Trustees)"],
      successorTrustee: "Emily Smith",
      beneficiaries: "Children and grandchildren per trust terms",
      purpose: "Avoid probate, facilitate smooth transfer of non-qualified assets, maintain privacy",
      assets: "Primary residence and joint brokerage account to be transferred to trust",
    },
    creditShelterTrust: {
      status: "Not established (not needed given current estate size)",
    },
  },
  lifeInsurance: [
    {
      type: "Term Life Insurance",
      carrier: "TIAA-CREF Life Insurance",
      faceValue: 500000,
      beneficiary: "Sarah Smith",
      purpose: "Income replacement if John dies before retirement",
      note: "Policy expires at age 70; consider reducing or eliminating in retirement",
    },
  ],
  charitableGiving: {
    intent: "Moderate charitable giving during retirement, planned legacy gifts",
    donorAdvisedFund: {
      status: "Under consideration",
      note: "May establish DAF for tax-efficient charitable giving, funded with appreciated securities",
    },
    plannedGifts: [
      {
        organization: "University Alumni Foundation",
        type: "Bequest via will",
        amount: "Specific bequest of $50,000",
      },
    ],
  },
  trusteeDuties: [
    "Manage and safeguard trust assets on behalf of beneficiaries.",
    "Follow instructions outlined in the Revocable Living Trust document.",
    "Make distributions to beneficiaries according to trust terms.",
    "Maintain records and provide financial reporting for trust activities.",
    "Act in the best fiduciary interest of the beneficiaries.",
    "Coordinate with advisors and professionals (legal, tax, investment) when managing trust assets.",
  ],
  documentsNeeded: [
    { document: "Revocable Living Trust", priority: "High", status: "complete" },
    { document: "Last Will and Testament", priority: "High", status: "complete" },
    { document: "Healthcare Power of Attorney", priority: "High", status: "complete" },
    { document: "Durable Power of Attorney (Financial)", priority: "High", status: "complete" },
    { document: "Living Will / Advance Directive", priority: "High", status: "complete" },
    { document: "Beneficiary Designations (Retirement)", priority: "High", status: "complete" },
    { document: "Asset Retitling to Trust", priority: "Medium", status: "pending" },
    { document: "HIPAA Authorization", priority: "Medium", status: "complete" },
  ],
  actionItems: [
    {
      id: 1,
      action: "Transfer primary residence and joint brokerage to Revocable Living Trust",
      responsible: "John + Sarah + Estate Attorney",
      status: "In Progress",
    },
    {
      id: 2,
      action: "Review and update beneficiary designations after relocation to Maine",
      responsible: "John + Financial Advisor",
      status: "Scheduled",
    },
    {
      id: 3,
      action: "Establish Donor Advised Fund for charitable giving",
      responsible: "John + Sarah + Financial Advisor",
      status: "Pending",
    },
    {
      id: 4,
      action: "Review life insurance needs post-retirement",
      responsible: "John + Sarah + Insurance Advisor",
      status: "Pending",
    },
    {
      id: 5,
      action: "Update will to include specific bequests and charitable gifts",
      responsible: "John + Sarah + Estate Attorney",
      status: "Pending",
    },
  ],
}

// John Smith Profile Comparison Data (IPS vs RTQ alignment)
export const johnSmithProfileComparison = [
  {
    category: "Risk Tolerance",
    ipsValue: "Moderate",
    rtqValue: "Moderate (Score: 55)",
    status: "aligned" as const,
    note: "Excellent alignment — consistent risk assessment",
  },
  {
    category: "Time Horizon",
    ipsValue: "10–15 Years",
    rtqValue: "10–15 Years",
    status: "aligned" as const,
    note: "Aligned — appropriate for pre-retirement phase",
  },
  {
    category: "Return Target",
    ipsValue: "5–7% annualized (net)",
    rtqValue: "5–7% expected by client",
    status: "aligned" as const,
    note: "Realistic expectations aligned with risk profile",
  },
  {
    category: "Primary Objective",
    ipsValue: "Balanced Growth + Income",
    rtqValue: "Balanced Growth and Income",
    status: "aligned" as const,
    note: "Perfect alignment",
  },
  {
    category: "Equity Allocation",
    ipsValue: "55% (target)",
    rtqValue: "55% (suggested)",
    status: "aligned" as const,
    note: "Current: 58% — minor rebalancing needed",
  },
  {
    category: "Fixed Income Allocation",
    ipsValue: "35% (target)",
    rtqValue: "35% (suggested)",
    status: "aligned" as const,
    note: "Current: 32% — minor rebalancing needed",
  },
  {
    category: "Liquidity Planning",
    ipsValue: "$100k-$120k annual distributions",
    rtqValue: "4-5% withdrawal rate",
    status: "aligned" as const,
    note: "Sustainable withdrawal rate given pension income",
  },
  {
    category: "Tax Efficiency",
    ipsValue: "Emphasized in IPS",
    rtqValue: "Noted as priority constraint",
    status: "aligned" as const,
    note: "Roth conversion strategy under evaluation",
  },
]

// AI Suggested Actions for John Smith
export const johnSmithAISuggestedActions = [
  {
    id: 1,
    priority: "high",
    action: "Implement Roth conversion ladder strategy (ages 65-72)",
    rationale:
      "John will be in lower tax bracket after retirement (before RMDs begin at 73). Converting $50k-$75k annually from Traditional 403(b) to Roth 403(b) could reduce future tax liability and provide tax-free growth. Model shows potential tax savings of $150k+ over retirement.",
    category: "Tax Planning",
  },
  {
    id: 2,
    priority: "high",
    action: "Execute tax-loss harvesting in joint brokerage account",
    rationale:
      "Several positions have unrealized losses from 2022 downturn. Harvest ~$30k in losses before year-end to offset gains and carry forward. Can generate $3k annual ordinary income deduction for 10+ years.",
    category: "Tax Optimization",
  },
  {
    id: 3,
    priority: "high",
    action: "Complete transfer of assets to Revocable Living Trust",
    rationale:
      "Primary residence ($650k) and joint brokerage ($650k) should be titled to trust to avoid probate. Pennsylvania probate can take 9-12 months and incur 3-5% costs. Trust provides privacy and smooth transfer to beneficiaries.",
    category: "Estate Planning",
  },
  {
    id: 4,
    priority: "medium",
    action: "Rebalance portfolio to target allocation (55/35/8/2)",
    rationale:
      "Current allocation (58/32/7/3) has drifted slightly. Equity overweight by 3%. Recommend trimming equity winners in tax-advantaged accounts and adding to fixed income. Minor adjustment, can execute over next quarter.",
    category: "Portfolio Management",
  },
  {
    id: 5,
    priority: "medium",
    action: "Develop sequence-of-returns mitigation strategy",
    rationale:
      "First 5 years of retirement are critical for portfolio longevity. Consider establishing 2-year cash reserve ($200k-$240k) in stable value/money market to avoid selling equities in downturn. Bond tent strategy: increase bonds to 40% at retirement, then gradually reduce to 35% by age 70.",
    category: "Retirement Planning",
  },
  {
    id: 6,
    priority: "medium",
    action: "Evaluate delaying Social Security to age 70 for higher benefits",
    rationale:
      "Current plan: claim at 67 for $58k/year. Delaying to 70 increases benefit to ~$72k/year (24% increase). Given pension income ($77k) and portfolio size ($2.5M), can afford to delay. Breakeven analysis shows net positive by age 81. Strong consideration given longevity in family.",
    category: "Social Security Optimization",
  },
  {
    id: 7,
    priority: "medium",
    action: "Establish Donor Advised Fund for charitable giving",
    rationale:
      "Client plans moderate charitable giving in retirement. DAF funded with $50k of appreciated securities provides immediate tax deduction at today's higher tax rate, eliminates capital gains tax, and allows flexible grant-making in retirement. Can support University Alumni Foundation bequest goal.",
    category: "Charitable Planning",
  },
  {
    id: 8,
    priority: "low",
    action: "Review and potentially reduce life insurance coverage post-retirement",
    rationale:
      "Term policy ($500k) currently costs $2,400/year. After retirement with secure pension income and accumulated assets, need for life insurance decreases. Consider reducing to $250k or eliminating entirely to reduce expenses. Reassess after retirement transition.",
    category: "Insurance Planning",
  },
  {
    id: 9,
    priority: "low",
    action: "Increase 529 contributions for grandchildren before retirement",
    rationale:
      "Current balances: Olivia ($40k), Ethan ($40k). Additional $10k contributions this year (before retirement income drops) maximizes state tax deduction and provides more time for tax-free growth. Olivia will start college in 10 years.",
    category: "Education Planning",
  },
]

// Meeting Topics for John Smith
export const johnSmithMeetingTopics = [
  "Retirement transition planning (3-year timeline)",
  "Roth conversion strategy (ages 65-72)",
  "Tax-loss harvesting opportunities in brokerage account",
  "Sequence-of-returns risk mitigation (bond tent / cash reserve)",
  "Social Security claiming strategy (age 67 vs 70)",
  "Living Trust asset transfer completion",
  "Donor Advised Fund establishment for charitable giving",
  "Portfolio rebalancing to target allocation",
  "RMD planning and management (age 73+)",
  "Long-term care insurance consideration",
]
