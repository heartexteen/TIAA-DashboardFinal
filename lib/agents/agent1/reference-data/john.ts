import type { ClientReferenceData } from "./types"

export const johnReferenceData: ClientReferenceData = {
  clientKey: "john",

  ips: {
    clientProfile: {
      clientName: "John Smith",
      accounts: [
        {
          accountName: "John Smith \u2013 TIAA Traditional 403(b)",
          accountType: "Tax-Deferred",
          approximateValue: 1200000,
          institution: "TIAA",
          beneficiaryStatus: "complete",
        },
        {
          accountName: "John Smith \u2013 TIAA Roth 403(b)",
          accountType: "Tax-Free",
          approximateValue: 350000,
          institution: "TIAA",
          beneficiaryStatus: "complete",
        },
        {
          accountName: "John & Sarah Smith Joint Brokerage",
          accountType: "Taxable",
          approximateValue: 650000,
          institution: "Vanguard",
          beneficiaryStatus: "complete",
        },
        {
          accountName: "John Smith \u2013 Rollover IRA",
          accountType: "Tax-Deferred",
          approximateValue: 300000,
          institution: "Vanguard",
          beneficiaryStatus: "complete",
        },
      ],
      totalPortfolioValue: 2500000,
    },
    currentHoldings: {
      equity: 58,
      fixedIncome: 32,
      realAssets: 7,
      cash: 3,
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
      "Target annualized net return of 5\u20137% over a full market cycle, balancing growth needs with capital preservation as client approaches retirement. Focus on total return (growth + income) with gradual shift toward income-producing assets.",
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
          "John will receive $45,000/year from university pension starting at age 65. Sarah receives $32,000/year from teacher\u2019s pension. Combined Social Security benefits estimated at $58,000/year starting at age 67 (delayed claiming strategy). Total fixed income: ~$135,000/year in retirement.",
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
    rebalancingPolicy: {
      frequency: "Quarterly review, rebalance when allocation drifts beyond allowable ranges",
      taxConsideration: "Prioritize rebalancing in tax-advantaged accounts to minimize tax impact",
    },
  },

  rtq: {
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
        selected: "10\u201315 Years",
        points: 7,
        note: "Planning for 20+ year retirement, but gradual transition to income focus over next 3 years",
      },
      primaryInvestmentObjective: {
        selected: "Balanced Growth and Income",
        points: 5,
      },
      annualSpendingPolicy: {
        selected: "Moderate (4\u20135%)",
        points: 5,
        note: "Plan to withdraw $100k-$120k annually from portfolio in retirement",
      },
      returnExpectation: {
        selected: "5\u20137%",
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
        selected: "High \u2014 Extensive investment experience, follows markets closely",
        points: 12,
      },
    },
    riskAssessment: {
      totalScore: 55,
      riskProfile: "Moderate",
      scoreRange: "52\u201367",
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
  },

  estate: {
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
      "Federal estate tax exemption (2026): $15,000,000 per individual, $30,000,000 for married couple. John and Sarah\u2019s combined estate (~$3.2M including home) is well below exemption; no federal estate tax concern. Pennsylvania inheritance tax may apply (3.5% for children).",
    assetsAndRecipients: [
      {
        asset: "TIAA Traditional 403(b)",
        value: 1200000,
        recipient: "Primary: Sarah Smith; Secondary: 50% Emily, 50% Michael",
        status: "complete",
      },
      {
        asset: "TIAA Roth 403(b)",
        value: 350000,
        recipient: "Primary: Sarah Smith; Secondary: 50% Emily, 50% Michael",
        status: "complete",
      },
      {
        asset: "Vanguard Rollover IRA",
        value: 300000,
        recipient: "Primary: Sarah Smith; Secondary: 50% Emily, 50% Michael",
        status: "complete",
      },
      {
        asset: "Vanguard Joint Brokerage (JTWROS)",
        value: 650000,
        recipient: "Joint with Right of Survivorship with Sarah Smith",
        status: "complete",
      },
      {
        asset: "Primary Residence",
        value: 650000,
        recipient: "Joint ownership with Sarah; passes to children via will",
        status: "complete",
      },
      {
        asset: "529 College Savings Plans (grandchildren)",
        value: 80000,
        recipient: "Olivia Smith ($40k), Ethan Smith ($40k)",
        status: "complete",
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
  },

  profileComparison: [
    {
      category: "Risk Tolerance",
      ipsValue: "Moderate",
      rtqValue: "Moderate (Score: 55)",
      status: "aligned",
      note: "Excellent alignment \u2014 consistent risk assessment",
    },
    {
      category: "Time Horizon",
      ipsValue: "10\u201315 Years",
      rtqValue: "10\u201315 Years",
      status: "aligned",
      note: "Aligned \u2014 appropriate for pre-retirement phase",
    },
    {
      category: "Return Target",
      ipsValue: "5\u20137% annualized (net)",
      rtqValue: "5\u20137% expected by client",
      status: "aligned",
      note: "Realistic expectations aligned with risk profile",
    },
    {
      category: "Primary Objective",
      ipsValue: "Balanced Growth + Income",
      rtqValue: "Balanced Growth and Income",
      status: "aligned",
      note: "Perfect alignment",
    },
    {
      category: "Equity Allocation",
      ipsValue: "55% (target)",
      rtqValue: "55% (suggested)",
      status: "aligned",
      note: "Current: 58% \u2014 minor rebalancing needed",
    },
    {
      category: "Fixed Income Allocation",
      ipsValue: "35% (target)",
      rtqValue: "35% (suggested)",
      status: "aligned",
      note: "Current: 32% \u2014 minor rebalancing needed",
    },
    {
      category: "Liquidity Planning",
      ipsValue: "$100k-$120k annual distributions",
      rtqValue: "4-5% withdrawal rate",
      status: "aligned",
      note: "Sustainable withdrawal rate given pension income",
    },
    {
      category: "Tax Efficiency",
      ipsValue: "Emphasized in IPS",
      rtqValue: "Noted as priority constraint",
      status: "aligned",
      note: "Roth conversion strategy under evaluation",
    },
  ],

  aiSuggestions: [
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
        "Client plans moderate charitable giving in retirement. DAF funded with $50k of appreciated securities provides immediate tax deduction at today\u2019s higher tax rate, eliminates capital gains tax, and allows flexible grant-making in retirement. Can support University Alumni Foundation bequest goal.",
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
  ],

  meetingTopics: [
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
  ],
}
