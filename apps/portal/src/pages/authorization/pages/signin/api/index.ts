import ApiService, { withAPI } from "@workspace/flowtrove/lib/network"
import type { SignInSchema } from "./validations"
import type { Tokens, User } from "@workspace/flowtrove/types"

export interface SignInResponseType {
    tokens?: Tokens,
    user?: User
    sessionId?: string
    error?: {
        field?: string
        message?: string
    }
}
export async function signIn(data: SignInSchema) {
    return ApiService.fetchData<SignInResponseType>({
        url: withAPI(data.checkEmail ? '/authorization/check-email' : '/authorization/sign-in'),
        method: 'post',
        data
    })
}