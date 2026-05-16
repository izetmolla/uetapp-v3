import ApiService, { withAPI } from "@workspace/flowtrove/lib/network"
import type { ResetPasswordSchema } from "./validations"
import type { Tokens, User } from "@workspace/flowtrove/types"
export interface ResetPasswordResponseType {
    tokens?: Tokens,
    user?: User
    sessionId?: string
    error?: {
        field?: string
        message?: string
    }
}
export async function resetPassword(data: ResetPasswordSchema) {
    return ApiService.fetchData<ResetPasswordResponseType>({
        url: withAPI('/authorization/reset'),
        method: 'post',
        data
    })
}