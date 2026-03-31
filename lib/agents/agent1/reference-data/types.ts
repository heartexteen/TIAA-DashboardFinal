export type ClientReferenceData = {
  clientKey: string
  ips: {
    clientProfile: {
      clientName: string
      accounts: Array<{
        accountName: string
        accountType: string
        approximateValue: number
        institution: string
        beneficiaryStatus: string
      }>
      totalPortfolioValue: number
    }
    currentHoldings?: {
      asOf?: string
      currency?: string
      accounts?: Array<{
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
      }>
      equity?: number
      fixedIncome?: number
      realAssets?: number
      cash?: number
    }
    investmentObjectives: string[]
    riskTolerance: string
    timeHorizon: string
    liquidityNeeds: string
    returnGoal: string
    targetAssetAllocation: {
      portfolioProfile: string
      allocations: Array<{
        assetClass: string
        targetAllocation: number
        allowableMin: number
        allowableMax: number
      }>
    }
    advisorNotes: Array<{ title: string; content: string }>
    benchmarks: Array<{ assetClass: string; benchmark: string }>
    rebalancingPolicy?: {
      frequency: string
      taxConsideration: string
    }
  }
  rtq: {
    client: {
      name: string
      document: string
    }
    financialProfile: {
      assetsUnderConsideration: number
      employerStock?: {
        company: string
        approxValue: number
        note: string
      }
      pensionIncome?: {
        source: string
        annualAmount: number
        note: string
      }
      socialSecurity?: {
        estimatedAnnual: number
        claimAge: number
        note: string
      }
    }
    investmentPreferences: {
      timeHorizon: { selected: string; points: number; note?: string }
      primaryInvestmentObjective: { selected: string; points: number }
      annualSpendingPolicy: { selected: string; points: number; note?: string }
      returnExpectation: { selected: string; points: number }
      investmentApproach: { selected: string; points: number }
      reactionToLoss: { scenario: string; selected: string; points: number }
      mostFearedEvent: { selected: string; points: number }
      investmentKnowledge: { selected: string; points: number }
    }
    riskAssessment: {
      totalScore: number
      riskProfile: string
      scoreRange: string
      description: string
    }
    suggestedAssetAllocation: {
      equity: number
      fixedIncome: number
      alternatives?: number
      realAssets?: number
      cash: number
    }
    investmentConstraints: {
      esgPreference: boolean
      notes: string[]
    }
  }
  estate: {
    personalInformation: {
      name: string
      age?: number
      maritalStatus: string
      spouse?: {
        name: string
        age: number
      }
      children: Array<{ name: string; age: number; relationship: string }>
      grandchildren?: Array<{ name: string; age: number }>
      stateOfResidence: string
    }
    powerOfAttorney: {
      primary: string
      alternate: string
      document?: string
    }
    healthcareDirective?: {
      healthcareProxy: string
      alternate: string
      document: string
    }
    beneficiaries: {
      qualified: string
      primary: Array<{ name: string; percentage: number; accounts: string[] }>
      secondary: Array<{ name: string; percentage: number; accounts: string[] }>
    }
    taxExemption: string
    assetsAndRecipients: Array<{
      asset: string
      value: number
      recipient: string
      status: string
    }>
    trusts?: {
      revocableLivingTrust: {
        status: string
        established?: string
        trustees?: string[]
        successorTrustee?: string
        beneficiaries?: string
        purpose?: string
        assets?: string
      }
      creditShelterTrust: {
        status: string
      }
    }
    lifeInsurance?: Array<{
      type: string
      carrier: string
      faceValue: number
      beneficiary: string
      purpose: string
      note: string
    }>
    charitableGiving?: {
      intent: string
      donorAdvisedFund: {
        status: string
        note: string
      }
      plannedGifts: Array<{
        organization: string
        type: string
        amount: string
      }>
    }
    trusteeDuties: string[]
    documentsNeeded: Array<{ document: string; priority: string; status: string }>
    actionItems: Array<{ id?: number; action: string; responsible: string; status: string }>
  }
  profileComparison: Array<{
    category: string
    ipsValue: string
    rtqValue: string
    status: string
    note?: string
  }>
  aiSuggestions: Array<{
    id: number
    priority: string
    action: string
    rationale: string
    category: string
  }>
  meetingTopics: string[]
}
