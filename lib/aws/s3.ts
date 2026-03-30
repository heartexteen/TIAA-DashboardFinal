/**
 * Thin S3 helper layer used by the "agentic" backend.
 *
 * Why this exists:
 * - Keep AWS SDK usage in one place.
 * - Keep the rest of the app working with simple JSON reads/writes.
 * - Make it obvious what keys/prefixes we use for Agent 1 outputs.
 */

import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { getTiaaS3Config } from "./config"

function getS3Client() {
  const { region } = getTiaaS3Config()
  // Credentials are automatically loaded from env vars by the AWS SDK.
  return new S3Client({ region })
}

async function readBodyAsString(body: any): Promise<string> {
  // AWS SDK v3 returns body as a stream in Node; transformToString exists in many runtimes.
  if (!body) return ""
  if (typeof body.transformToString === "function") return await body.transformToString()

  // Fallback: accumulate chunks.
  const chunks: Uint8Array[] = []
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const merged = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    merged.set(c, offset)
    offset += c.length
  }
  return new TextDecoder().decode(merged)
}

export async function s3GetText(args: { bucket: string; key: string }): Promise<string> {
  const s3 = getS3Client()
  const resp = await s3.send(new GetObjectCommand({ Bucket: args.bucket, Key: args.key }))
  return await readBodyAsString(resp.Body)
}

export async function s3GetJson<T>(args: { bucket: string; key: string }): Promise<T> {
  const text = await s3GetText(args)
  try {
    return JSON.parse(text) as T
  } catch (err: any) {
    throw new Error(`Failed to parse JSON from s3://${args.bucket}/${args.key}: ${err?.message || String(err)}`)
  }
}

export async function s3PutJson(args: { bucket: string; key: string; value: unknown }): Promise<void> {
  const s3 = getS3Client()
  const body = JSON.stringify(args.value, null, 2)

  await s3.send(
    new PutObjectCommand({
      Bucket: args.bucket,
      Key: args.key,
      Body: body,
      ContentType: "application/json; charset=utf-8",
      CacheControl: "no-store",
    }),
  )
}

/**
 * List client folder keys under a prefix using S3 "common prefixes".
 *
 * Example:
 * - prefix: agent1(extractor)-output(json)/
 * - returns: ["carina", "john"]
 */
export async function s3ListSubPrefixes(args: {
  bucket: string
  prefix: string
}): Promise<string[]> {
  const s3 = getS3Client()
  const resp = await s3.send(
    new ListObjectsV2Command({
      Bucket: args.bucket,
      Prefix: args.prefix,
      Delimiter: "/",
      MaxKeys: 1000,
    }),
  )

  const prefixes = (resp.CommonPrefixes || [])
    .map((p) => p.Prefix)
    .filter(Boolean)
    .map((p) => String(p))

  // Convert "prefix/client/" -> "client"
  const base = args.prefix
  return prefixes
    .map((p) => p.startsWith(base) ? p.slice(base.length) : p)
    .map((p) => p.replace(/\/$/, ""))
    .filter((p) => p.length > 0)
}

export async function s3ListKeys(args: { bucket: string; prefix: string; maxKeys?: number }): Promise<string[]> {
  const s3 = getS3Client()
  const resp = await s3.send(
    new ListObjectsV2Command({
      Bucket: args.bucket,
      Prefix: args.prefix,
      MaxKeys: args.maxKeys ?? 1000,
    }),
  )
  return (resp.Contents || []).map((c) => c.Key).filter(Boolean).map((k) => String(k))
}

