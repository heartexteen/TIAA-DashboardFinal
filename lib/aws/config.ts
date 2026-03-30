/**
 * Centralized configuration for AWS + S3 usage.
 *
 * Important:
 * - Never hardcode credentials in code.
 * - For local dev, rely on environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, AWS_REGION).
 *
 * This file only reads non-secret configuration values like bucket name + prefixes.
 */

export type TiaaS3Config = {
  bucket: string
  region: string
  agent1: {
    inputPrefix: string
    outputPrefix: string
    promptPrefix: string
  }
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function normalizePrefix(prefix: string): string {
  // S3 "folders" are just prefixes; we standardize to always end with "/".
  if (!prefix) return ""
  return prefix.endsWith("/") ? prefix : `${prefix}/`
}

/**
 * Load configuration with safe defaults for this project.
 *
 * Defaults match the S3 structure you described:
 * - Bucket: tiaa-test-1
 * - agent1(extractor)-input(PDF)/
 * - agent1(extractor)-output(json)/
 * - json-prompt/ (inside the input prefix)
 */
export function getTiaaS3Config(): TiaaS3Config {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1"

  // You can override these without changing code.
  const bucket = process.env.TIAA_S3_BUCKET || "tiaa-test-1"

  const agent1InputPrefix = normalizePrefix(
    process.env.TIAA_AGENT1_INPUT_PREFIX || "agent1(extractor)-input(PDF)/",
  )
  const agent1OutputPrefix = normalizePrefix(
    process.env.TIAA_AGENT1_OUTPUT_PREFIX || "agent1(extractor)-output(json)/",
  )

  // Prompts live under input prefix by default (agent1(extractor)-input(PDF)/json-prompt/...)
  const promptPrefix = normalizePrefix(
    process.env.TIAA_AGENT1_PROMPT_PREFIX || `${agent1InputPrefix}json-prompt/`,
  )

  // Sanity checks (non-secret).
  requireEnv("TIAA_S3_BUCKET", bucket)

  return {
    bucket,
    region,
    agent1: {
      inputPrefix: agent1InputPrefix,
      outputPrefix: agent1OutputPrefix,
      promptPrefix,
    },
  }
}

