/**
 * High-level convenience API on top of the configured `BaseService`.
 *
 * `ApiService` wraps the raw axios client with three thin helpers
 * shaped around the patterns this codebase uses everywhere:
 *
 *   - `fetchData`        - call an endpoint and resolve to the full
 *                          AxiosResponse so the caller can inspect
 *                          headers/status.
 *   - `fetchDataBody`    - same, but resolves to just `response.data`
 *                          for the common case where the body is
 *                          everything you care about.
 *   - `uploadFileData`   - multipart upload helper with progress and
 *                          structured success/error callbacks.
 *
 * The shape of `ResponseWithError` and `ResponseWithPagination` is
 * dictated by the backend's response envelope; keeping them next to
 * the service keeps the contract centralized.
 */

import type {
    AxiosError,
    AxiosProgressEvent,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios"

import { BaseService } from "./client"

/**
 * Standard error envelope the backend returns either inline on a
 * 200 (`{ error: true, ... }`) or as the JSON body of a 4xx/5xx
 * response. Centralizing the shape makes toast/copy code reusable.
 */
export interface ResponseWithError {
    error?: boolean
    message?: string
    code?: string
    details?: {
        field?: string
    }
}

/** Paginated list response shape. */
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

const ApiService = {
    fetchData<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>,
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
        param: AxiosRequestConfig<Request>,
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
        },
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

export default ApiService
