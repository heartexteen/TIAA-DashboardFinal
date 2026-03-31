import type { ClientReferenceData } from "./types"

export const carinaReferenceData: ClientReferenceData = {
  clientKey: "carina",

  ips: {
    clientProfile: {
      clientName: "Carina Voss",
      accounts: [
        {
          accountName: "Carina \u2013 Fidelity Traditional IRA",
          accountType: "Tax-Deferred",
          approximateValue: 480000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
        {
          accountName: "Carina \u2013 Fidelity ROTH IRA",
          accountType: "Tax-Free",
          approximateValue: 220000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
        {
          accountName: "Carina \u2013 Individual Brokerage",
          accountType: "Taxable",
          approximateValue: 500000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
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
      "Given the client\u2019s risk tolerance, the Advisor will seek the best possible returns at an appropriate level of risk, targeting an annualized net return of 7\u20139% over a full market cycle.",
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
  },

  rtq: {
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
        selected: "5\u201310 Years",
        points: 6,
        note: "Client may retire early and anticipates needing portfolio income within 7\u20138 years",
      },
      primaryInvestmentObjective: {
        selected: "Income",
        points: 3,
      },
      annualSpendingPolicy: {
        selected: "Moderate (2\u20135%)",
        points: 6,
      },
      returnExpectation: {
        selected: "3\u20135%",
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
        selected: "Moderate \u2014 Some investment experience",
        points: 9,
      },
    },
    riskAssessment: {
      totalScore: 45,
      riskProfile: "Moderate Conservative",
      scoreRange: "38\u201351",
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
  },

  estate: {
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
      qualified: "To be determined \u2014 no beneficiaries identified",
      primary: [],
      secondary: [],
    },
    taxExemption:
      "Federal estate tax exemption (2026): $15,000,000. Carina\u2019s estate (~$1.2M) is well below this threshold; no federal estate tax concern currently.",
    assetsAndRecipients: [
      {
        asset: "Fidelity Traditional IRA",
        value: 480000,
        recipient: "To be determined (beneficiary designation required)",
        status: "action_required",
      },
      {
        asset: "Fidelity ROTH IRA",
        value: 220000,
        recipient: "To be determined (beneficiary designation required)",
        status: "action_required",
      },
      {
        asset: "Individual Brokerage Account",
        value: 500000,
        recipient: "To be determined (TOD beneficiary or via will)",
        status: "action_required",
      },
      {
        asset: "Acme Technologies Employer Stock",
        value: 85000,
        recipient: "To be determined",
        status: "pending",
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
  },

  profileComparison: [
    {
      category: "Risk Tolerance",
      ipsValue: "Moderately Aggressive",
      rtqValue: "Moderately Conservative (Score: 45)",
      status: "mismatch",
      note: "Significant discrepancy \u2014 warrants advisor review",
    },
    {
      category: "Time Horizon",
      ipsValue: "20+ Years",
      rtqValue: "5\u201310 Years (early retirement)",
      status: "mismatch",
      note: "Discrepancy \u2014 Carina may retire in 7\u20138 yrs",
    },
    {
      category: "Return Target",
      ipsValue: "7\u20139% annualized (net)",
      rtqValue: "3\u20135% expected by client",
      status: "mismatch",
      note: "Discrepancy \u2014 expectation gap to address",
    },
    {
      category: "Primary Objective",
      ipsValue: "Growth + Income + Legacy",
      rtqValue: "Income",
      status: "warning",
      note: "Partially aligned",
    },
    {
      category: "Equity Allocation",
      ipsValue: "75%",
      rtqValue: "40%",
      status: "mismatch",
      note: "Significant divergence \u2014 review needed",
    },
    {
      category: "Fixed Income Allocation",
      ipsValue: "15%",
      rtqValue: "50%",
      status: "mismatch",
      note: "Significant divergence \u2014 review needed",
    },
    {
      category: "ESG Preference",
      ipsValue: "Yes (where available)",
      rtqValue: "Yes (noted as constraint)",
      status: "aligned",
      note: "Aligned",
    },
    {
      category: "Concentrated Stock",
      ipsValue: "~$85K Acme Technologies",
      rtqValue: "~$85K (noted as constraint)",
      status: "aligned",
      note: "Aligned \u2014 diversify opportunistically",
    },
  ],

  aiSuggestions: [
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
      action: "Clarify retirement timeline (7\u20138 years) vs IPS 20+ year horizon",
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
  ],

  meetingTopics: [
    "Risk profile reconciliation (IPS vs RTQ)",
    "Retirement timeline clarification",
    "Acme Technologies stock diversification plan",
    "Beneficiary designation updates",
    "Estate planning document execution",
    "ESG investment review",
    "Return expectations alignment",
  ],
}
