import type { ClientReferenceData } from "./types"

export const mariaReferenceData: ClientReferenceData = {
  clientKey: "maria",

  ips: {
    clientProfile: {
      clientName: "Maria Lopez",
      accounts: [
        {
          accountName: "Maria \u2013 Fidelity Traditional IRA",
          accountType: "Tax-Deferred",
          approximateValue: 620000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
        {
          accountName: "Maria \u2013 Fidelity ROTH IRA",
          accountType: "Tax-Free",
          approximateValue: 380000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
        {
          accountName: "Maria \u2013 Individual Brokerage",
          accountType: "Taxable",
          approximateValue: 750000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
        {
          accountName: "Maria \u2013 401(k)",
          accountType: "Tax-Deferred",
          approximateValue: 480000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
        {
          accountName: "Maria \u2013 Revocable Living Trust",
          accountType: "Taxable/Trust",
          approximateValue: 370000,
          institution: "Fidelity",
          beneficiaryStatus: "incomplete",
        },
      ],
      totalPortfolioValue: 2600000,
    },
    investmentObjectives: [
      "Capital Preservation",
      "Income",
      "Growth and Income",
      "Growth",
      "Gifting / Legacy Goals",
    ],
    riskTolerance: "Aggressive",
    timeHorizon: "5 \u2013 10 Years",
    liquidityNeeds:
      "Maria anticipates transitioning to early retirement within approximately 5\u20137 years, at which point portfolio distributions are expected to begin. A moderate cash reserve will be maintained to support this timeline. No immediate withdrawal schedule is anticipated at this time.",
    returnGoal:
      "Given the client\u2019s risk tolerance, the Advisor will seek the best possible returns at an appropriate level of risk, targeting an annualized net return of 9\u201311% over a full market cycle, consistent with an Aggressive equity-tilted allocation.",
    targetAssetAllocation: {
      portfolioProfile: "Aggressive",
      allocations: [
        { assetClass: "Equity", targetAllocation: 85, allowableMin: 75, allowableMax: 95 },
        { assetClass: "Fixed Income", targetAllocation: 8, allowableMin: 5, allowableMax: 15 },
        { assetClass: "Alternatives", targetAllocation: 5, allowableMin: 0, allowableMax: 10 },
        { assetClass: "Cash & Equivalents", targetAllocation: 2, allowableMin: 0, allowableMax: 5 },
      ],
    },
    advisorNotes: [
      {
        title: "Concentrated Stock Position",
        content:
          "Maria holds approximately $120,000 in employer stock (NovaTech Industries). This position will be treated as a Domestic Large Cap equivalent in the allocation model. Diversification will be pursued opportunistically in light of her tax situation.",
      },
      {
        title: "Early Retirement Timeline",
        content:
          "Maria anticipates retiring within 5\u20137 years. The portfolio is structured to support an aggressive growth phase now, transitioning toward income generation as retirement approaches. Withdrawal planning should be revisited annually.",
      },
      {
        title: "Upcoming Liquidity Events",
        content:
          "No significant near-term liquidity needs identified beyond routine planning. Portfolio is structured for high growth consistent with a 5\u201310 year horizon and Aggressive risk profile.",
      },
      {
        title: "Trust Account",
        content:
          "Maria\u2019s Revocable Living Trust ($370,000) is managed in coordination with her estate plan and will be invested consistent with this IPS.",
      },
    ],
    benchmarks: [
      { assetClass: "Fixed Income", benchmark: "Bloomberg U.S. Aggregate Bond Index" },
      { assetClass: "Equities", benchmark: "MSCI ACWI Index" },
      { assetClass: "Alternatives", benchmark: "50% MSCI World REITs / 50% Bloomberg Commodity Index" },
    ],
    rebalancingPolicy: {
      frequency: "Annual",
      taxConsideration:
        "Tax efficiency will be considered for all taxable account holdings. Tax-loss-harvesting will be employed where practical. Long-term capital gains and qualified dividends are preferred. Texas residency eliminates state income tax considerations.",
    },
  },

  rtq: {
    client: {
      name: "Maria Lopez",
      document: "Penobscot Financial Advisors Risk Tolerance Questionnaire",
    },
    financialProfile: {
      assetsUnderConsideration: 2600000,
      employerStock: {
        company: "NovaTech Industries",
        approxValue: 120000,
        note: "Concentrated employer stock position to be considered in equity allocation",
      },
    },
    investmentPreferences: {
      timeHorizon: {
        selected: "5\u201310 Years",
        points: 9,
        note: "Client anticipates early retirement within 5\u20137 years",
      },
      primaryInvestmentObjective: {
        selected: "Growth",
        points: 9,
      },
      annualSpendingPolicy: {
        selected: "Low (0\u20132%)",
        points: 9,
      },
      returnExpectation: {
        selected: "9\u201311%",
        points: 12,
      },
      investmentApproach: {
        selected:
          "Willing to accept significant short-term volatility in pursuit of higher long-term returns",
        points: 12,
      },
      reactionToLoss: {
        scenario: "Portfolio loses 20% in first year",
        selected: "Stay the course and maintain the allocation",
        points: 12,
      },
      mostFearedEvent: {
        selected: "Not meeting long-term retirement goals",
        points: 9,
      },
      investmentKnowledge: {
        selected: "Advanced \u2014 Experienced investor",
        points: 12,
      },
    },
    riskAssessment: {
      totalScore: 84,
      riskProfile: "Aggressive",
      scoreRange: "78\u2013100",
      description:
        "Portfolio designed to pursue high long-term growth with significant tolerance for short-term market volatility.",
    },
    suggestedAssetAllocation: {
      equity: 85,
      fixedIncome: 8,
      alternatives: 5,
      cash: 2,
    },
    investmentConstraints: {
      esgPreference: false,
      notes: [
        "Employer stock concentration (NovaTech Industries) should be considered when evaluating domestic equity exposure.",
        "Texas residency \u2014 no state income tax considerations.",
      ],
    },
  },

  estate: {
    personalInformation: {
      name: "Maria Lopez",
      maritalStatus: "Single",
      children: [],
      stateOfResidence: "Texas",
    },
    powerOfAttorney: {
      primary: "To Be Named by Client",
      alternate: "To Be Named by Client",
    },
    beneficiaries: {
      qualified: "To be determined \u2014 beneficiaries identified via Revocable Living Trust",
      primary: [],
      secondary: [],
    },
    taxExemption:
      "Federal estate tax exemption (2026): $15,000,000. Maria\u2019s estate (~$2.6M) is well below this threshold; no federal estate tax concern currently. Texas has no state estate tax.",
    assetsAndRecipients: [
      {
        asset: "Fidelity Traditional IRA",
        value: 620000,
        recipient: "To be determined (beneficiary designation required)",
        status: "action_required",
      },
      {
        asset: "Fidelity ROTH IRA",
        value: 380000,
        recipient: "To be determined (beneficiary designation required)",
        status: "action_required",
      },
      {
        asset: "Individual Brokerage Account",
        value: 750000,
        recipient: "To be determined (TOD beneficiary or via will)",
        status: "action_required",
      },
      {
        asset: "401(k)",
        value: 480000,
        recipient: "To be determined (beneficiary designation required)",
        status: "action_required",
      },
      {
        asset: "Revocable Living Trust",
        value: 370000,
        recipient: "Per trust document",
        status: "active",
      },
      {
        asset: "NovaTech Industries Employer Stock",
        value: 120000,
        recipient: "To be determined",
        status: "pending",
      },
    ],
    trusts: {
      revocableLivingTrust: {
        status: "active",
        beneficiaries: "Per trust document",
        purpose: "Manage estate distribution and avoid probate",
        assets: "$370,000 currently funded",
      },
      creditShelterTrust: {
        status: "not_applicable",
      },
    },
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
      { document: "Advance Medical Directive (Living Will)", priority: "High", status: "pending" },
      { document: "Durable General POA (Financial)", priority: "High", status: "pending" },
      { document: "IRA Beneficiary Designations", priority: "High", status: "pending" },
      { document: "401(k) Beneficiary Designation", priority: "High", status: "pending" },
      { document: "TOD Designation (Brokerage)", priority: "Medium", status: "pending" },
      { document: "HIPAA Authorization", priority: "Medium", status: "pending" },
      { document: "NovaTech Stock Exit Strategy", priority: "Medium", status: "pending" },
    ],
    actionItems: [
      {
        id: 1,
        action: "Identify and confirm executor, POA agent, and health care agent",
        responsible: "Maria",
        status: "Pending",
      },
      {
        id: 2,
        action: "Update IRA and 401(k) beneficiary designations",
        responsible: "Maria",
        status: "Pending",
      },
      {
        id: 3,
        action: "Add TOD designation to individual brokerage account",
        responsible: "Maria + Fidelity",
        status: "Pending",
      },
      {
        id: 4,
        action: "Review NovaTech Industries stock exit / diversification plan with PFA",
        responsible: "Maria + PFA",
        status: "Pending",
      },
      {
        id: 5,
        action: "Plan drawdown strategy ahead of early retirement in 5\u20137 years",
        responsible: "Maria + PFA",
        status: "Pending",
      },
      {
        id: 6,
        action: "Review Revocable Living Trust funding and successor trustee",
        responsible: "Maria + Attorney",
        status: "Pending",
      },
      {
        id: 7,
        action: "Clarify charitable/legacy gifting goals and identify specific organizations",
        responsible: "Maria",
        status: "Pending",
      },
    ],
  },

  profileComparison: [
    {
      category: "Risk Tolerance",
      ipsValue: "Aggressive",
      rtqValue: "Aggressive (Score: 84)",
      status: "aligned",
      note: "Aligned",
    },
    {
      category: "Time Horizon",
      ipsValue: "5\u201310 Years",
      rtqValue: "5\u201310 Years",
      status: "aligned",
      note: "Aligned \u2014 early retirement in 5\u20137 years",
    },
    {
      category: "Return Target",
      ipsValue: "9\u201311% annualized (net)",
      rtqValue: "9\u201311% expected by client",
      status: "aligned",
      note: "Aligned",
    },
    {
      category: "Equity Allocation",
      ipsValue: "85%",
      rtqValue: "85%",
      status: "aligned",
      note: "Aligned",
    },
    {
      category: "Fixed Income Allocation",
      ipsValue: "8%",
      rtqValue: "8%",
      status: "aligned",
      note: "Aligned",
    },
    {
      category: "Concentrated Stock",
      ipsValue: "~$120K NovaTech Industries",
      rtqValue: "~$120K (noted as constraint)",
      status: "aligned",
      note: "Aligned \u2014 diversify opportunistically",
    },
  ],

  aiSuggestions: [
    {
      id: 1,
      priority: "high",
      action: "Review diversification plan for concentrated NovaTech Industries stock ($120k)",
      rationale:
        "Concentrated position represents ~5% of portfolio. Tax-efficient diversification strategies should be discussed ahead of early retirement.",
      category: "Portfolio Management",
    },
    {
      id: 2,
      priority: "high",
      action: "Update beneficiary designations across all retirement accounts",
      rationale:
        "IRA, ROTH IRA, and 401(k) lack beneficiary designations. Critical for estate planning and to avoid probate.",
      category: "Estate Planning",
    },
    {
      id: 3,
      priority: "high",
      action: "Build drawdown plan for early retirement in 5\u20137 years",
      rationale:
        "Portfolio is positioned for aggressive growth today but must transition toward income generation as retirement approaches.",
      category: "Financial Planning",
    },
    {
      id: 4,
      priority: "medium",
      action: "Add TOD designation to individual brokerage account",
      rationale:
        "Brokerage account ($750K) should have a TOD designation or be titled through the Revocable Living Trust to avoid probate.",
      category: "Estate Planning",
    },
    {
      id: 5,
      priority: "medium",
      action: "Confirm successor trustee and funding of Revocable Living Trust",
      rationale:
        "Trust is active with $370K funded. Confirm successor trustee and ensure remaining assets are coordinated with the trust.",
      category: "Estate Planning",
    },
    {
      id: 6,
      priority: "medium",
      action: "Execute remaining estate planning documents (Will, POA, AMD)",
      rationale:
        "Core estate documents are still pending execution. Completing them reduces estate administration risk.",
      category: "Estate Planning",
    },
    {
      id: 7,
      priority: "low",
      action: "Annual review of target asset allocation ahead of retirement transition",
      rationale:
        "Aggressive 85/8/5/2 allocation is appropriate now, but the glide path toward retirement should be revisited annually.",
      category: "Portfolio Review",
    },
  ],

  meetingTopics: [
    "NovaTech Industries stock diversification plan",
    "Early retirement drawdown strategy (5\u20137 year horizon)",
    "Beneficiary designation updates across retirement accounts",
    "Revocable Living Trust funding and successor trustee",
    "TOD designation for individual brokerage account",
    "Estate planning document execution (Will, POA, AMD)",
    "Annual allocation review ahead of retirement transition",
  ],
}
