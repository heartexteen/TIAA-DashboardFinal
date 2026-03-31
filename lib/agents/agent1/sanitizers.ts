import type { Agent1DocumentType } from "./contracts"

export function ensureString(value: unknown): string {
  if (typeof value === "string") return value
  if (value == null) return ""
  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    // Extract text from common LLM object shapes like {duty: "...", title: "...", description: "..."}
    for (const key of ["text", "duty", "title", "name", "description", "content", "value", "summary"]) {
      if (typeof obj[key] === "string" && obj[key]) return obj[key] as string
    }
    // Last resort: join all string values
    const strings = Object.values(obj).filter((v): v is string => typeof v === "string" && v.length > 0)
    if (strings.length > 0) return strings.join(" — ")
    return ""
  }
  return String(value)
}

export function ensureNumber(value: unknown) {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

export function ensureStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => ensureString(item)).filter(Boolean) : []
}

export function sanitizeIpsData(input: any) {
  const defaultAllocations = [
    { assetClass: "Equity", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
    { assetClass: "Fixed Income", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
    { assetClass: "Alternatives", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
    { assetClass: "Cash & Equivalents", targetAllocation: 0, allowableMin: 0, allowableMax: 100 },
  ]

  const rawAllocations = Array.isArray(input?.targetAssetAllocation?.allocations) ? input.targetAssetAllocation.allocations : []
  const normalizedAllocations = defaultAllocations.map((base) => {
    const match = rawAllocations.find((item: any) => {
      const assetClass = ensureString(item?.assetClass).toLowerCase()
      if (base.assetClass === "Equity") return assetClass.includes("equity")
      if (base.assetClass === "Fixed Income") return assetClass.includes("fixed")
      if (base.assetClass === "Cash & Equivalents") return assetClass.includes("cash")
      return !assetClass.includes("equity") && !assetClass.includes("fixed") && !assetClass.includes("cash")
    })

    return {
      assetClass: ensureString(match?.assetClass) || base.assetClass,
      targetAllocation: ensureNumber(match?.targetAllocation),
      allowableMin: ensureNumber(match?.allowableMin),
      allowableMax: ensureNumber(match?.allowableMax) || 100,
    }
  })

  return {
    clientProfile: {
      clientName: ensureString(input?.clientProfile?.clientName),
      accounts: Array.isArray(input?.clientProfile?.accounts)
        ? input.clientProfile.accounts.map((account: any) => ({
            accountName: ensureString(account?.accountName),
            accountType: ensureString(account?.accountType),
            approximateValue: ensureNumber(account?.approximateValue),
            institution: ensureString(account?.institution),
            beneficiaryStatus: ensureString(account?.beneficiaryStatus),
          }))
        : [],
      totalPortfolioValue: ensureNumber(input?.clientProfile?.totalPortfolioValue),
    },
    currentHoldings: {
      asOf: ensureString(input?.currentHoldings?.asOf),
      currency: ensureString(input?.currentHoldings?.currency) || "USD",
      accounts: Array.isArray(input?.currentHoldings?.accounts)
        ? input.currentHoldings.accounts.map((account: any) => ({
            accountName: ensureString(account?.accountName),
            accountType: ensureString(account?.accountType),
            institution: ensureString(account?.institution),
            holdings: Array.isArray(account?.holdings)
              ? account.holdings.map((holding: any) => ({
                  id: ensureString(holding?.id),
                  name: ensureString(holding?.name),
                  ticker: ensureString(holding?.ticker),
                  market: ensureString(holding?.market),
                  assetClass: ensureString(holding?.assetClass),
                  instrumentType: ensureString(holding?.instrumentType),
                  currency: ensureString(holding?.currency) || "USD",
                  units: ensureNumber(holding?.units),
                  price: ensureNumber(holding?.price),
                  marketValue: ensureNumber(holding?.marketValue),
                  costBasis: ensureNumber(holding?.costBasis),
                  unrealizedGain: ensureNumber(holding?.unrealizedGain),
                  yield: ensureNumber(holding?.yield),
                  expenseRatio: ensureNumber(holding?.expenseRatio),
                  durationYears: ensureNumber(holding?.durationYears),
                  creditQuality: ensureString(holding?.creditQuality),
                  notes: ensureString(holding?.notes),
                }))
              : [],
          }))
        : [],
    },
    investmentObjectives: ensureStringArray(input?.investmentObjectives),
    riskTolerance: ensureString(input?.riskTolerance),
    timeHorizon: ensureString(input?.timeHorizon),
    liquidityNeeds: ensureString(input?.liquidityNeeds),
    returnGoal: ensureString(input?.returnGoal),
    targetAssetAllocation: {
      portfolioProfile: ensureString(input?.targetAssetAllocation?.portfolioProfile),
      allocations: normalizedAllocations,
    },
    advisorNotes: Array.isArray(input?.advisorNotes)
      ? input.advisorNotes.map((note: any) => ({
          title: ensureString(note?.title),
          content: ensureString(note?.content),
        }))
      : [],
    benchmarks: Array.isArray(input?.benchmarks)
      ? input.benchmarks.map((benchmark: any) => ({
          assetClass: ensureString(benchmark?.assetClass),
          benchmark: ensureString(benchmark?.benchmark),
        }))
      : [],
  }
}

export function sanitizeRtqData(input: any) {
  const prefs = input?.investmentPreferences
  const sanitizePref = (pref: any, extra?: Record<string, unknown>) => ({
    selected: ensureString(pref?.selected),
    points: ensureNumber(pref?.points),
    ...extra,
  })

  return {
    client: {
      name: ensureString(input?.client?.name),
      document: ensureString(input?.client?.document),
    },
    financialProfile: {
      assetsUnderConsideration: ensureNumber(input?.financialProfile?.assetsUnderConsideration),
      employerStock: {
        company: ensureString(input?.financialProfile?.employerStock?.company),
        approxValue: ensureNumber(input?.financialProfile?.employerStock?.approxValue),
        note: ensureString(input?.financialProfile?.employerStock?.note),
      },
      pensionIncome: {
        source: ensureString(input?.financialProfile?.pensionIncome?.source),
        annualAmount: ensureNumber(input?.financialProfile?.pensionIncome?.annualAmount),
        note: ensureString(input?.financialProfile?.pensionIncome?.note),
      },
      socialSecurity: {
        estimatedAnnual: ensureNumber(input?.financialProfile?.socialSecurity?.estimatedAnnual),
        claimAge: ensureNumber(input?.financialProfile?.socialSecurity?.claimAge),
        note: ensureString(input?.financialProfile?.socialSecurity?.note),
      },
    },
    investmentPreferences: {
      timeHorizon: sanitizePref(prefs?.timeHorizon, { note: ensureString(prefs?.timeHorizon?.note) }),
      primaryInvestmentObjective: sanitizePref(prefs?.primaryInvestmentObjective),
      annualSpendingPolicy: sanitizePref(prefs?.annualSpendingPolicy, { note: ensureString(prefs?.annualSpendingPolicy?.note) }),
      returnExpectation: sanitizePref(prefs?.returnExpectation),
      investmentApproach: sanitizePref(prefs?.investmentApproach),
      reactionToLoss: sanitizePref(prefs?.reactionToLoss, { scenario: ensureString(prefs?.reactionToLoss?.scenario) }),
      mostFearedEvent: sanitizePref(prefs?.mostFearedEvent),
      investmentKnowledge: sanitizePref(prefs?.investmentKnowledge),
    },
    riskAssessment: {
      totalScore: ensureNumber(input?.riskAssessment?.totalScore),
      riskProfile: ensureString(input?.riskAssessment?.riskProfile),
      scoreRange: ensureString(input?.riskAssessment?.scoreRange),
      description: ensureString(input?.riskAssessment?.description),
    },
    suggestedAssetAllocation: {
      equity: ensureNumber(input?.suggestedAssetAllocation?.equity),
      fixedIncome: ensureNumber(input?.suggestedAssetAllocation?.fixedIncome),
      alternatives: ensureNumber(input?.suggestedAssetAllocation?.alternatives),
      realAssets: ensureNumber(input?.suggestedAssetAllocation?.realAssets),
      cash: ensureNumber(input?.suggestedAssetAllocation?.cash),
    },
    investmentConstraints: {
      esgPreference: typeof input?.investmentConstraints?.esgPreference === "boolean" ? input.investmentConstraints.esgPreference : false,
      notes: ensureStringArray(input?.investmentConstraints?.notes),
    },
  }
}

export function sanitizeEstateData(input: any) {
  return {
    personalInformation: {
      name: ensureString(input?.personalInformation?.name),
      age: ensureNumber(input?.personalInformation?.age),
      maritalStatus: ensureString(input?.personalInformation?.maritalStatus),
      spouse: {
        name: ensureString(input?.personalInformation?.spouse?.name),
        age: ensureNumber(input?.personalInformation?.spouse?.age),
      },
      children: Array.isArray(input?.personalInformation?.children)
        ? input.personalInformation.children.map((child: any) => ({
            name: ensureString(child?.name),
            age: ensureNumber(child?.age),
            relationship: ensureString(child?.relationship),
          }))
        : [],
      grandchildren: Array.isArray(input?.personalInformation?.grandchildren)
        ? input.personalInformation.grandchildren.map((child: any) => ({
            name: ensureString(child?.name),
            age: ensureNumber(child?.age),
          }))
        : [],
      stateOfResidence: ensureString(input?.personalInformation?.stateOfResidence),
    },
    powerOfAttorney: {
      primary: ensureString(input?.powerOfAttorney?.primary),
      alternate: ensureString(input?.powerOfAttorney?.alternate),
      document: ensureString(input?.powerOfAttorney?.document),
    },
    healthcareDirective: {
      healthcareProxy: ensureString(input?.healthcareDirective?.healthcareProxy),
      alternate: ensureString(input?.healthcareDirective?.alternate),
      document: ensureString(input?.healthcareDirective?.document),
    },
    beneficiaries: {
      qualified: ensureString(input?.beneficiaries?.qualified),
      primary: Array.isArray(input?.beneficiaries?.primary)
        ? input.beneficiaries.primary.map((item: any) => ({
            name: ensureString(item?.name),
            percentage: ensureNumber(item?.percentage),
            accounts: ensureStringArray(item?.accounts),
          }))
        : [],
      secondary: Array.isArray(input?.beneficiaries?.secondary)
        ? input.beneficiaries.secondary.map((item: any) => ({
            name: ensureString(item?.name),
            percentage: ensureNumber(item?.percentage),
            accounts: ensureStringArray(item?.accounts),
          }))
        : [],
    },
    taxExemption: ensureString(input?.taxExemption),
    assetsAndRecipients: Array.isArray(input?.assetsAndRecipients)
      ? input.assetsAndRecipients.map((item: any) => ({
          asset: ensureString(item?.asset),
          value: ensureNumber(item?.value),
          recipient: ensureString(item?.recipient),
          status: ensureString(item?.status),
        }))
      : [],
    trusts: {
      revocableLivingTrust: {
        status: ensureString(input?.trusts?.revocableLivingTrust?.status),
        established: ensureString(input?.trusts?.revocableLivingTrust?.established),
        trustees: ensureStringArray(input?.trusts?.revocableLivingTrust?.trustees),
        successorTrustee: ensureString(input?.trusts?.revocableLivingTrust?.successorTrustee),
        beneficiaries: ensureString(input?.trusts?.revocableLivingTrust?.beneficiaries),
        purpose: ensureString(input?.trusts?.revocableLivingTrust?.purpose),
        assets: ensureString(input?.trusts?.revocableLivingTrust?.assets),
      },
      creditShelterTrust: {
        status: ensureString(input?.trusts?.creditShelterTrust?.status),
      },
    },
    lifeInsurance: Array.isArray(input?.lifeInsurance)
      ? input.lifeInsurance.map((item: any) => ({
          type: ensureString(item?.type),
          carrier: ensureString(item?.carrier),
          faceValue: ensureNumber(item?.faceValue),
          beneficiary: ensureString(item?.beneficiary),
          purpose: ensureString(item?.purpose),
          note: ensureString(item?.note),
        }))
      : [],
    charitableGiving: {
      intent: ensureString(input?.charitableGiving?.intent),
      donorAdvisedFund: {
        status: ensureString(input?.charitableGiving?.donorAdvisedFund?.status),
        note: ensureString(input?.charitableGiving?.donorAdvisedFund?.note),
      },
      plannedGifts: Array.isArray(input?.charitableGiving?.plannedGifts)
        ? input.charitableGiving.plannedGifts.map((item: any) => ({
            organization: ensureString(item?.organization),
            type: ensureString(item?.type),
            amount: ensureString(item?.amount),
          }))
        : [],
    },
    trusteeDuties: ensureStringArray(input?.trusteeDuties),
    documentsNeeded: Array.isArray(input?.documentsNeeded)
      ? input.documentsNeeded.map((item: any) => ({
          document: ensureString(item?.document || item?.name),
          priority: ensureString(item?.priority),
          status: ensureString(item?.status),
        }))
      : [],
    actionItems: Array.isArray(input?.actionItems)
      ? input.actionItems.map((item: any, index: number) => ({
          id: ensureNumber(item?.id) || index + 1,
          action: ensureString(item?.action),
          responsible: ensureString(item?.responsible),
          status: ensureString(item?.status),
        }))
      : [],
  }
}

export function sanitizeExtractedDocument(documentType: Agent1DocumentType, data: any) {
  if (documentType === "ips") return sanitizeIpsData(data)
  if (documentType === "rtq") return sanitizeRtqData(data)
  if (documentType === "estate") return sanitizeEstateData(data)
  return data
}
