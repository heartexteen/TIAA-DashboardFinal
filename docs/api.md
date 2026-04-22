# API Routes

All routes are Next.js App Router handlers under [app/api/](../app/api/). Base URL in development is `http://localhost:3000`.

## `GET /api/clients`
List registered clients with summary metadata. Source: [app/api/clients/route.ts](../app/api/clients/route.ts).

## `GET /api/clients/[clientKey]`
Return the full extracted state for a client: IPS, RTQ, Estate, alerts, AI suggestions, and meeting topics. Source: [app/api/clients/[clientKey]/](../app/api/clients/%5BclientKey%5D/).

- **Path params:** `clientKey` — one of the keys registered in [lib/non-pdf-client-data/](../lib/non-pdf-client-data/) (e.g., `carina`, `john`, `maria`).

## `POST /api/agent1/seed`
Run the Agent 1 extraction pipeline for all registered clients and write outputs to S3. Source: [app/api/agent1/seed/](../app/api/agent1/seed/). Calls `extractAgent1OutputsFromS3Pdfs()` in [lib/agents/agent1/pipeline/index.ts](../lib/agents/agent1/pipeline/index.ts).

- **Flow per client:** `loadPdfs` → `extractDocuments` (Bedrock) → `validate` → `deriveInsights` → `writeToS3`.
- **Returns:** `{ wrote: Array<{ clientKey, keys: string[] }> }` — S3 keys written.

## `POST /api/documents/upload`
Accept a PDF upload (multipart) and store it at the Agent 1 input prefix in S3. Source: [app/api/documents/upload/route.ts](../app/api/documents/upload/route.ts).

- **Body:** `multipart/form-data` with fields for the client key and the file.
- **Side effects:** writes to `s3://<bucket>/agent1(extractor)-input(PDF)/<clientKey>/<filename>`.

## `GET /api/documents/list`
List documents currently stored for a client. Source: [app/api/documents/list/route.ts](../app/api/documents/list/route.ts).

## `GET /api/documents/pdf`
Stream a stored PDF back to the browser for preview. Source: [app/api/documents/pdf/route.ts](../app/api/documents/pdf/route.ts).

## `GET /api/daily-summary`
Return the advisor's daily market summary (market overview, portfolio impact, client actions, risk alerts, sources). Source: [app/api/daily-summary/route.ts](../app/api/daily-summary/route.ts). Consumed by the dashboard home ([app/page.tsx](../app/page.tsx)).

## `POST /api/chat`
Advisor chat assistant. Source: [app/api/chat/route.ts](../app/api/chat/route.ts). Uses Bedrock via [lib/aws/config.ts](../lib/aws/config.ts).

## AWS configuration

All routes that touch S3/Bedrock/Lambda read configuration from [lib/aws/config.ts](../lib/aws/config.ts). Required environment variables are documented in the top-level [README.md](../README.md) under *Setup*.
