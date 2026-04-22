# Data Dictionary

Schemas extracted by Agent 1 from each input PDF type. Templates live in [lib/agents/agent1/contracts.ts](../lib/agents/agent1/contracts.ts); derived-insight validation uses Zod in the same file.

## IPS — Investment Policy Statement

Source: client-signed IPS PDF. Template: `IPS_TEMPLATE`.

| Field | Type | Description |
|---|---|---|
| `clientProfile.clientName` | string | Full legal name on the IPS. |
| `clientProfile.accounts[]` | array | One row per client account. |
| `clientProfile.accounts[].accountName` | string | Institution-facing account label. |
| `clientProfile.accounts[].accountType` | string | One of: `Tax-Deferred`, `Tax-Free`, `Taxable`. |
| `clientProfile.accounts[].approximateValue` | number (USD) | Current balance on IPS as-of date. |
| `clientProfile.accounts[].institution` | string | Custodian (e.g., TIAA, Vanguard). |
| `clientProfile.accounts[].beneficiaryStatus` | string | `complete`, `incomplete`, or `missing`. |
| `clientProfile.totalPortfolioValue` | number (USD) | Sum across accounts. |
| `currentHoldings.asOf` | string (date) | As-of date for holdings snapshot. |
| `currentHoldings.currency` | string | Default `USD`. |
| `currentHoldings.accounts[].holdings[]` | array | Per-lot / per-security rows. |
| `currentHoldings.accounts[].holdings[].assetClass` | string | `Equity`, `Fixed Income`, `Alternatives`, `Cash & Equivalents`. |
| `currentHoldings.accounts[].holdings[].marketValue` | number (USD) | Required. |
| `currentHoldings.accounts[].holdings[].{ticker,units,price,costBasis,unrealizedGain,yield,expenseRatio,durationYears,creditQuality}` | optional | Populated when legible in the PDF. |
| `investmentObjectives[]` | string[] | E.g., `Capital Preservation`, `Income Generation`. |
| `riskTolerance` | string | `Conservative` / `Moderate` / `Aggressive` (free text from IPS). |
| `timeHorizon` | string | Free text (e.g., `10-15 Years`). |
| `liquidityNeeds` | string | Narrative paragraph. |
| `returnGoal` | string | Narrative paragraph. |
| `targetAssetAllocation.portfolioProfile` | string | Named profile (e.g., `Moderate`). |
| `targetAssetAllocation.allocations[]` | array | Four rows: Equity, Fixed Income, Alternatives, Cash & Equivalents. |
| `targetAssetAllocation.allocations[].targetAllocation` | number (%) | 0–100. |
| `targetAssetAllocation.allocations[].allowableMin` / `allowableMax` | number (%) | IPS tolerance band. |
| `advisorNotes[]` | array | `{ title, content }` narrative blocks. |
| `benchmarks[]` | array | `{ assetClass, benchmark }` (e.g., S&P 500 for Equity). |

## RTQ — Risk Tolerance Questionnaire

Source: client-completed RTQ PDF. Template: `RTQ_TEMPLATE`.

| Field | Type | Description |
|---|---|---|
| `client.name` / `client.document` | string | Client name and source filename. |
| `financialProfile.assetsUnderConsideration` | number (USD) | Assets included in the risk assessment. |
| `financialProfile.employerStock` | object | `{ company, approxValue, note }`. |
| `financialProfile.pensionIncome` | object | `{ source, annualAmount, note }`. |
| `financialProfile.socialSecurity` | object | `{ estimatedAnnual, claimAge, note }`. |
| `investmentPreferences.*` | object | Each question: `{ selected, points, note? }`. Questions include `timeHorizon`, `primaryInvestmentObjective`, `annualSpendingPolicy`, `returnExpectation`, `investmentApproach`, `reactionToLoss`, `mostFearedEvent`, `investmentKnowledge`. |
| `riskAssessment.totalScore` | number | Summed points across RTQ questions. |
| `riskAssessment.riskProfile` | string | Mapped profile (e.g., `Moderate`). |
| `riskAssessment.scoreRange` | string | Range corresponding to the profile. |
| `riskAssessment.description` | string | Narrative description of the profile. |
| `suggestedAssetAllocation.{equity,fixedIncome,alternatives,realAssets,cash}` | number (%) | 0–100 each; sums to ~100. |
| `investmentConstraints.esgPreference` | boolean | ESG opt-in. |
| `investmentConstraints.notes[]` | string[] | Constraint free-text. |

## Estate — Estate Planning Worksheet

Source: estate planning PDF. Template: `ESTATE_TEMPLATE`.

| Field | Type | Description |
|---|---|---|
| `personalInformation.{name,age,maritalStatus,stateOfResidence}` | mixed | Client demographics. |
| `personalInformation.spouse` | object | `{ name, age }`. |
| `personalInformation.children[]` / `grandchildren[]` | array | Dependents with relationships / ages. |
| `powerOfAttorney` | object | `{ primary, alternate, document }`. |
| `healthcareDirective` | object | `{ healthcareProxy, alternate, document }`. |
| `beneficiaries.qualified` | string | Qualified-account beneficiary statement. |
| `beneficiaries.primary[]` / `secondary[]` | array | `{ name, percentage, accounts[] }`. |
| `taxExemption` | string | Current federal/state exemption position. |
| `assetsAndRecipients[]` | array | `{ asset, value, recipient, status }`. |
| `trusts.revocableLivingTrust` | object | `{ status, established, trustees[], successorTrustee, beneficiaries, purpose, assets }`. |
| `trusts.creditShelterTrust.status` | string | Status only. |
| `lifeInsurance[]` | array | `{ type, carrier, faceValue, beneficiary, purpose, note }`. |
| `charitableGiving` | object | `{ intent, donorAdvisedFund{status,note}, plannedGifts[] }`. |
| `trusteeDuties[]` | string[] | Trustee responsibility bullets. |
| `documentsNeeded[]` | array | `{ document, priority, status }` checklist. |
| `actionItems[]` | array | `{ id?, action, responsible, status }`. |

## Derived insights

Produced by [lib/agents/agent1/pipeline/derive-insights.ts](../lib/agents/agent1/pipeline/derive-insights.ts); validated by `DERIVED_INSIGHTS_SCHEMA` (Zod).

| Field | Type | Description |
|---|---|---|
| `alerts[]` | array (≤ 6) | `{ type, title, description, priority }` — surfaced on the dashboard home. |
| `aiSuggestions[]` | array (≤ 10) | `{ priority, action, rationale, category }`. |
| `meetingTopics[]` | string[] (≤ 12) | Agenda suggestions for the next client meeting. |

## Domain types (UI-side)

Shared types consumed by React pages live in [lib/domain/types.ts](../lib/domain/types.ts) (`Holding`, `HoldingsSnapshot`, etc.) and are kept aligned with the Agent 1 templates above.
