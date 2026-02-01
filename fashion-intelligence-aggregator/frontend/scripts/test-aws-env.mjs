#!/usr/bin/env node
/**
 * Loads frontend/.env.local and tests AWS S3 access (list bucket).
 * Run from repo root: node frontend/scripts/test-aws-env.mjs
 * Or from frontend: node scripts/test-aws-env.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { S3Client, ListObjectsV2Command, HeadBucketCommand } from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
config({ path: envPath });

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!bucket || !region || !accessKey || !secretKey) {
  console.error("Missing env: AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY");
  process.exit(1);
}

const client = new S3Client({
  region,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
});

async function main() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log("OK: HeadBucket succeeded for s3://%s (region: %s)", bucket, region);
    const list = await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }));
    const count = list.KeyCount ?? 0;
    console.log("OK: ListObjectsV2 returned %d key(s). AWS env is working.", count);
  } catch (err) {
    console.error("AWS test failed:", err.message);
    process.exit(1);
  }
}

main();
