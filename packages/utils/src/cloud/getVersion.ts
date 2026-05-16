import axios, { isAxiosError } from "axios";

const url = "https://uet.izetmolla.com/api/admin/getversion";

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
      url,
      {
        token: "tfghdfgkjvncrjfdbgfnvkjncrdfjkgnvdfcjihrtjdfgnbjhvtkgfndbfjhvkncsrhdfbvjknbcuhrfdij",
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
