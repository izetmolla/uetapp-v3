import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import axios, { isAxiosError } from "axios";
import mime from "mime-types";
import { Client } from "minio";

const apiBaseUrl = "https://www.flowtrove.com/api/admin";
const apiToken = "tfghdfgkjvncrjfdbgfnvkjncrdfjkgnvdfcjihrtjdfgnbjhvtkgfndbfjhvkncsrhdfbvjknbcuhrfdij";

export type ServiceVersionResult = { currentVersion: string };

function parseVersionPayload(data: unknown): ServiceVersionResult | null {
    if (
        data != null &&
        typeof data === "object" &&
        "currentVersion" in data &&
        typeof (data as { currentVersion: unknown }).currentVersion === "string"
    ) {
        return {
            currentVersion: (data as { currentVersion: string }).currentVersion,
        };
    }
    return null;
}

export async function getServiceVersion(
    service: string,
): Promise<ServiceVersionResult> {
    console.log(`Fetching service version for ${service}...`);
    try {
        const { data } = await axios.post<unknown>(
            `${apiBaseUrl}/getversion`,
            {
                token: apiToken,
                service,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );

        const parsed = parseVersionPayload(data);
        if (parsed) {
            return parsed;
        }

        throw new Error(
            `getServiceVersion: unexpected response shape: ${JSON.stringify(data)}`,
        );
    } catch (err) {
        let reason: string;
        if (isAxiosError(err)) {
            if (err.response) {
                const { status, statusText, data } = err.response;
                const body =
                    typeof data === "string"
                        ? data
                        : data != null
                            ? JSON.stringify(data)
                            : "";
                reason = `HTTP ${status} ${statusText}${body ? ` — ${body}` : ""}`;
            } else if (err.request) {
                reason = `no response from server (${err.code ?? "unknown"}): ${err.message}`;
            } else {
                reason = err.message;
            }
        } else {
            reason = err instanceof Error ? err.message : String(err);
        }
        console.error("getServiceVersion failed:", reason);
        throw new Error(`getServiceVersion failed: ${reason}`);
    }
}


const ROOT_DIR = process.cwd();

const minioClient = new Client({
    endPoint: "10.100.200.70",
    port: 9000,
    useSSL: false,
    accessKey: "imolla",
    secretKey: "grtdrgftretgbtgvrsdgfrtrhfgfg",
});



function runCommandLive(command: string, args: string[], cwd = process.cwd()): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: "inherit",
            shell: process.platform === "win32",
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
        });

        child.on("error", reject);
    });
}

async function stageBuildProject(service: string) {
    console.log("🚀 Stage 1/4: Building project (live logs enabled)...");
    await runCommandLive("pnpm", ["build", "--filter", service]);
    console.log("✅ Build completed");
}

async function stageReadBuiltVersion(service: string): Promise<string> {
    console.log("🚀 Stage 2/4: Reading package version after build...");
    try {
        const { currentVersion } = await getServiceVersion(service);
        console.log("bumpVersion", currentVersion);
        const cvArray = currentVersion.split(".");
        cvArray[2] = (parseInt(cvArray[2]) + 1).toString();
        return cvArray.join(".");
    } catch (error) {
        throw new Error("bumpVersion failed: " + error);
    }
}

async function uploadDirectory(
    bucketName: string,
    localDir: string,
    remoteBasePath = "",
) {
    const items = fs.readdirSync(localDir, { withFileTypes: true });

    for (const item of items) {
        const localPath = path.join(localDir, item.name);
        const remotePath = path.posix.join(remoteBasePath, item.name);

        if (item.name === "node_modules" || item.name === ".git") continue;

        if (item.isDirectory()) {
            await uploadDirectory(bucketName, localPath, remotePath);
            continue;
        }

        await minioClient.fPutObject(bucketName, remotePath, localPath, {
            "Content-Type": mime.lookup(localPath) || "application/octet-stream",
        });
        console.log(`✅ Uploaded: ${remotePath}`);
    }
}

function getLocalDir(service: string) {
    return path.join(ROOT_DIR, "apps", service, "dist");
}


async function stageUploadToMinio(service: string, version: string) {
    console.log("🚀 Stage 3/4: Uploading dist to MinIO...");
    const bucketName = "ft-public";
    const remoteBase = `${service}/${version}`;

    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName);
        console.log(`Bucket created: ${bucketName}`);
    }

    await uploadDirectory(bucketName, getLocalDir(service), remoteBase);
    console.log("✅ Dist upload completed");
}

async function pushTopApp(service: string, version: string) {
    console.log(`🚀 Stage 4/4: Updating frontend on top app for ${version}...`);
    const distIndexPath = path.join(getLocalDir(service), "index.html");
    const bodyContent = fs.readFileSync(distIndexPath, "utf8");
    const manifestContent = fs.readFileSync(path.join(getLocalDir(service), ".vite", "manifest.json"), "utf8");

    try {
        await axios.post(
            `${apiBaseUrl}/updatefrontend`,
            {
                body_content: bodyContent,
                manifest_content: manifestContent,
                token: apiToken,
                version: version,
                service: service,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (err) {
        let reason: string;
        if (isAxiosError(err)) {
            if (err.response) {
                const { status, statusText, data } = err.response;
                const body =
                    typeof data === "string"
                        ? data
                        : data != null
                            ? JSON.stringify(data)
                            : "";
                reason = `HTTP ${status} ${statusText}${body ? ` — ${body}` : ""}`;
            } else if (err.request) {
                reason = `no response from server (${err.code ?? "unknown"}): ${err.message}`;
            } else {
                reason = err.message;
            }
        } else {
            reason = err instanceof Error ? err.message : String(err);
        }
        console.error("pushTopApp failed:", reason);
        throw new Error(`pushTopApp failed: ${reason}`);
    }

    console.log("✅ Top app frontend update request sent successfully");
}


function checkIfAppExists(service: string) {
    const apps = fs.readdirSync(path.join(ROOT_DIR, "apps"));
    return apps.includes(service);
}

export async function main() {
    const args = process.argv
    if (args.length < 3) {
        console.error("❌ Service is required");
        process.exitCode = 1;
        return;
    }
    const service = args[2];
    if (service == "") {
        console.error("❌ Service is required");
        process.exitCode = 1;
        return;
    }
    if (!checkIfAppExists(service)) {
        console.error("❌ App does not exist");
        process.exitCode = 1;
        return;
    }
    await stageBuildProject(service);

    const nextVersion = await stageReadBuiltVersion(service);
    await stageUploadToMinio(service, nextVersion);
    await pushTopApp(service, nextVersion);
    console.log("🎉 Release flow completed");
}

main().catch((error) => {
    console.error("❌ Release failed:", error);
    process.exitCode = 1;
});
