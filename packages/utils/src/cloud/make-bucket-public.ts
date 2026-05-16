import * as Minio from "minio";

///////////////////////////////////////
// CONFIG (EDIT THESE)
///////////////////////////////////////
const ENDPOINT = "192.168.11.50";
const PORT = 30014;
const USE_SSL = false;

const ACCESS_KEY = "imolla";
const SECRET_KEY = "DFnC7C8Gd8l5tDKFYsfxxonu2Zi9q5UmDpj6ZR4Z";

const BUCKET_NAME = "uetedu-v3";

///////////////////////////////////////
// INIT CLIENT
///////////////////////////////////////
const client = new Minio.Client({
  endPoint: ENDPOINT,
  port: PORT,
  useSSL: USE_SSL,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

///////////////////////////////////////
// MAIN FLOW
///////////////////////////////////////
async function setupBucket() {
  try {
    // 1. Check if bucket exists
    const exists = await client.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log("📦 Creating bucket...");
      await client.makeBucket(BUCKET_NAME, "us-east-1");
    } else {
      console.log("✅ Bucket already exists");
    }

    // 2. Set public policy
    console.log("🌍 Setting public policy...");

    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    await client.setBucketPolicy(
      BUCKET_NAME,
      JSON.stringify(policy)
    );

    console.log("✅ Bucket is now PUBLIC (read-only)");

    // 3. Show URL
    const protocol = USE_SSL ? "https" : "http";
    console.log("🌐 Access URL:");
    console.log(`${protocol}://${ENDPOINT}:${PORT}/${BUCKET_NAME}`);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

setupBucket();