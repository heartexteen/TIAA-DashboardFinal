# Data Access & Handling

This project operates under an EPA / NDA with the project sponsor (TIAA).

**Important:** The sponsor has **not** provided any real client data to the project team. Every client persona, PDF, and reference-data record in this repository — *Carina*, *John Smith*, *Maria* — is **author-created synthetic test data** generated for development and demonstration. There is no real PII, no real client holdings, and no confidential sponsor material in this repo.

The rules below define the data-handling posture that would apply **if** real sponsor data were ever shared. They are in place pre-emptively so that (a) accidental uploads of confidential material are blocked by default, and (b) reviewers can see the policy is defined.

## What lives where

| Data class | Example | Location | Committed to git? |
|---|---|---|---|
| Synthetic test PDFs (IPS, RTQ, Estate) | `Carina_IPS.pdf`, `JohnSmith_RTQ.pdf`, `Maria_Estate_Planning.pdf` — author-created, not real clients | S3: `s3://tiaa-test-1/agent1(extractor)-input(PDF)/<client>/` and local folder [pdfData/](pdfData/) | **Yes** — included so reviewers can run the pipeline end-to-end. Safe because the personas are fictional. |
| Extracted / structured output (JSON) | Agent 1 pipeline outputs (IPS / RTQ / Estate JSON) for synthetic personas | S3: `s3://tiaa-test-1/agent1(extractor)-output/<client>/` | **No** — written at runtime |
| Synthetic / seed reference data | [lib/agents/agent1/reference-data/](lib/agents/agent1/reference-data/), [lib/non-pdf-client-data/](lib/non-pdf-client-data/) | Repo | **Yes** — author-generated, no real client data |
| Redacted sample outputs | [results/](results/) | Repo | **Yes** — placeholder values only |
| Source code | [app/](app/), [lib/](lib/), [components/](components/) | Repo | Yes |

## What is shareable under the NDA

**Currently in the repo (all safe):**
- Source code and pipeline logic.
- Schema definitions. See [docs/data-dictionary.md](docs/data-dictionary.md).
- Fictional client personas (*Carina*, *John Smith*, *Maria*) — author-created, not real TIAA clients.
- Placeholder-only sample extraction outputs under [results/](results/).

**Policy: never commit, if it ever exists:**
- Real client PDFs or any document containing PII for a real sponsor client.
- Extracted JSON derived from real client PDFs.
- AWS credentials, API keys, or production sponsor bucket names.
- Internal sponsor process docs, org charts, pricing, or meeting notes.

## How PDFs are handled at runtime

1. An advisor uploads a PDF via the UI ([app/api/documents/upload/route.ts](app/api/documents/upload/route.ts)), which writes to the S3 input prefix.
2. Agent 1's pipeline reads the PDF from S3 ([lib/agents/agent1/pipeline/load-pdfs.ts](lib/agents/agent1/pipeline/load-pdfs.ts)), extracts structured JSON via Bedrock, validates it, derives insights, and writes JSON back to the S3 output prefix ([lib/agents/agent1/pipeline/write-to-s3.ts](lib/agents/agent1/pipeline/write-to-s3.ts)).
3. The dashboard reads the output JSON — it never pulls the raw PDF into git or the bundle.

## Requesting access

If you are a reviewer or collaborator who needs access to the sponsor S3 bucket or the raw PDFs:

- **Contact:** Kittimate Chulajata — kittimatechulajata@gmail.com / kchulaja@andrew.cmu.edu
- Provide your AWS account ID or AndrewID and the purpose of access.
- Access is granted case-by-case under the terms of the sponsor EPA/NDA.

## If confidential data was accidentally committed

1. Do **not** push. If already pushed, rotate any exposed credentials immediately.
2. Remove from history with `git filter-repo` (not just `git rm` — that leaves the blob in history).
3. Notify the sponsor contact per the EPA reporting clause.
4. Force-push to a **private** remote only; coordinate with the team before rewriting shared history.
