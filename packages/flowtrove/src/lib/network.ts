import type {
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    AxiosProgressEvent,
    InternalAxiosRequestConfig,
} from "axios"

import axios from "axios"

import { jwtDecode } from "jwt-decode"
import { toast } from "sonner"
import useAuthorizationStore from "../store/authorization"
import { QueryClient } from "@tanstack/react-query"
import { getGlobalOptions, mergeInitialData } from "./globalOptions"

export const exceptedPaths: string[] = []

export const TOKEN_TYPE = "Bearer "
export const REQUEST_HEADER_AUTH_KEY = "Authorization"
const unauthorizedCode = [401]
const serverErrorCode = [500]
const authErrorCodes = [
    "INVALID_CREDENTIALS",
    "TOKEN_EXPIRED",
    "TOKEN_INVALID",
    "AUTH_REQUIRED",
    "INSUFFICIENT_PERMISSIONS",
    "ROLE_NOT_ALLOWED",
    "API_KEY_FORBIDDEN",
]

function getServiceName(): string {
    return document.getElementById('__GLOBAL_DATA__')?.dataset?.app ?? "/"
}

const baseApiURL = (): string => {
    const sn = getServiceName()
    if (sn === "app") {
        return `${window.location.protocol}//${window.location.host}`
    }
    return `${window.location.protocol}//${window.location.host}/${sn}`
}

const BaseService = axios.create({
    timeout: 60000,
    baseURL: baseApiURL(),
})

console.log("API Base URL:", BaseService.defaults.baseURL)

/** One in-flight refresh for all concurrent requests (avoids duplicate refresh calls and log spam). */
let refreshAccessTokenInFlight: Promise<void> | null = null

async function refreshAccessTokenWithConfig(
    config: InternalAxiosRequestConfig,
    refresh_token: string
): Promise<void> {
    if (refreshAccessTokenInFlight) {
        await refreshAccessTokenInFlight
        return
    }
    refreshAccessTokenInFlight = (async () => {
        const store = useAuthorizationStore.getState()
        const nodeEnv = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } })
            .process?.env?.NODE_ENV
        if (nodeEnv === "development") {
            console.log("Access token expired, refreshing...")
        }
        const { data } = await axios({
            ...config,
            headers: {
                ...config.headers,
                accept: "application/json",
                Authorization: `Bearer ${refresh_token}`,
                cft: "t",
            },
        })
        if (data && isValidJwtFormat(data)) {
            store.setAccessToken(data)
        }
    })()
    try {
        await refreshAccessTokenInFlight
    } finally {
        refreshAccessTokenInFlight = null
    }
}

export function isValidJwtFormat(token?: string) {
    if (typeof token !== "string") return false

    try {
        jwtDecode(token) // decodes payload only
        return true
    } catch {
        return false
    }
}

BaseService.interceptors.request.use(
    async (config) => {
        const store = useAuthorizationStore.getState()
        const { access_token = "", refresh_token = "" } = store?.tokens || {}

        if (access_token == "" || access_token == "") {
            config.headers["cra"] = `t`
        } else {
            config.headers["cra"] = `f`
        }
        if (typeof access_token == "string" && access_token != "") {
            const decoded = jwtDecode(access_token)
            if (Number(decoded.exp) * 1000 < Date.now()) {
                if (typeof refresh_token === "string" && refresh_token !== "") {
                    await refreshAccessTokenWithConfig(config, refresh_token)
                }
                const { access_token: newAccess = "" } =
                    useAuthorizationStore.getState()?.tokens || {}
                if (newAccess) {
                    config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${newAccess}`
                }
                return config
            } else {
                config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${access_token}`
                return config
            }
        } else {
            return config
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

BaseService.interceptors.response.use(
    (response) => {
        if (response && response.status === 200 && response.data?.reauthorize) {
            const { signInUser } = useAuthorizationStore.getState()
            signInUser({
                user: response.data.user,
                tokens: response?.data?.tokens,
            })
            return BaseService(response.config)
        }
        return response
    },
    (error) => {
        const { response } = error
        if (response && unauthorizedCode?.includes(response.status)) {
            console.log("Handling 401 unauthorized error.", response?.data?.code)
            if (response?.data && authErrorCodes.includes(response.data.code)) {
                // toast.error(response.data.message || "Authentication error. Please sign in again.");
            } else {
                const { signOut } = useAuthorizationStore.getState()
                console.log("Unauthorized", response)
                toast.error("Unauthorized")
                // store.dispatch(signOutSuccess());
                signOut()
            }
        }
        if (response && serverErrorCode?.includes(response.status)) {
            console.log("Server error with code 500!", response)
            //   toast.error("Server error with code 500!", {
            //     position: toast.POSITION.BOTTOM_RIGHT,
            //   });
        }
        return Promise.reject(error)
    }
)

const ApiService = {
    fetchData<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>
    ) {
        return new Promise<AxiosResponse<Response>>((resolve, reject) => {
            BaseService(param)
                .then((response: AxiosResponse<Response>) => {
                    resolve(response)
                })
                .catch((errors: AxiosError) => {
                    reject(errors)
                })
        })
    },
    /** Same as fetchData but resolves to `response.data` (typed body). */
    async fetchDataBody<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>
    ): Promise<Response> {
        const r = await this.fetchData<Response, Request>(param)
        return r.data
    },
    uploadFileData<Response = unknown, Request = Record<string, unknown>>(
        path: string,
        file: File,
        options?: {
            body?: Request
            onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
            onFinish?: (data: Response) => void
            onError?: (error: ResponseWithError) => void
        }
    ) {
        return new Promise<AxiosResponse<Response>>(async (resolve, reject) => {
            try {
                const formData = new FormData()
                formData.append("file", file)
                if (options?.body) {
                    formData.append("body", JSON.stringify(options.body))
                }

                const uploaded = await BaseService.post(path, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    ...(options && options.onUploadProgress
                        ? { onUploadProgress: options.onUploadProgress }
                        : {}),
                })

                if (uploaded?.data?.error) {
                    if (options?.onError) options.onError(uploaded.data.error)
                } else {
                    if (options?.onFinish) options.onFinish(uploaded.data)
                }
                resolve(uploaded.data)
            } catch (error) {
                if (options?.onError)
                    options.onError({
                        message: (error as AxiosError).message,
                        error: true,
                        code: "UPLOAD_FAILED",
                        details: { field: "file" },
                    })
                reject(error)
            }
        })
    },
}

export interface ResponseWithError {
    error?: boolean
    message?: string
    code?: string
    details?: {
        field?: string
    }
}

export interface ResponseWithPagination<T> extends ResponseWithError {
    data: T[]
    pagination: {
        page: number
        limit: number
        pageCount: number
        total: number
        total_pages: number
    }
}


export function withService<T>(params?: T & { service?: string }): T & { service: string } {
    const service = window?.location?.pathname?.split("/")?.length > 1
        ? window?.location?.pathname?.split("/")?.[1]
        : params?.service ?? ""
    if (exceptedPaths.includes(service)) {
        return { service: "", ...params } as T & { service: string }
    }
    return { service, ...params } as T & { service: string }
}

export interface WithPagination<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
}

export const withError = (error: Error | null, data: any) => {
    if (error) return error
    if (data?.error) return new Error(data.message)
    return null
}

const queryClient = new QueryClient()



function withAPI(path: string) {
    if (path.startsWith("/")) {
        return `api${path}`
    }
    return `api/${path}`
}



// Other functions to be used in the workspace
export function withInitialData<T>(contentKey: string = "data", data?: T) {
    const initialData = getGlobalOptions<T>(contentKey);
    return {
        enabled: !initialData,
        initialData: mergeInitialData(initialData, data),
    }
}
/** Backend may respond with HTTP 200 and `{ error: true, message?: string }`. */
export function isApiErrorBody(body: unknown): boolean {
    if (!body || typeof body !== "object") return false;
    const err = (body as Record<string, unknown>).error;
    return err === true || err === "true" || err === 1;
}
/** Toast-safe copy from `{ error: true, message?, code? }` bodies (often HTTP 200). */
export function getApiErrorMessageFromBody(body: unknown, fallback: string): string {
    if (!body || typeof body !== "object") return fallback;
    const o = body as Record<string, unknown>;
    const msg = o.message;
    if (typeof msg === "string") {
        const t = msg.trim();
        if (t.length > 0) return t;
    } else if (msg != null && typeof msg !== "object" && typeof msg !== "undefined") {
        const t = String(msg).trim();
        if (t.length > 0) return t;
    }
    const code = o.code;
    if (typeof code === "string") {
        const t = code.trim();
        if (t.length > 0) return t;
    }
    return fallback;
}

/** Message for failed requests (4xx/5xx, network errors) — safe for toast copy. */
export function getRequestErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data

        if (data != null && typeof data === "object" && !Array.isArray(data)) {
            const msg = getApiErrorMessageFromBody(data, "")
            if (msg) return msg
        }
        if (typeof data === "string" && data.trim().length > 0) {
            const text = data.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
            if (text.length > 0) return text.length > 280 ? `${text.slice(0, 280)}…` : text
        }
        if (status === 404) {
            return error.response?.statusText?.trim() || "Not found"
        }
        if (typeof error.message === "string" && error.message.trim().length > 0) {
            return error.message.trim()
        }
    }
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message.trim()
    }
    return fallback
}

export default ApiService
export { BaseService, queryClient, withAPI }
