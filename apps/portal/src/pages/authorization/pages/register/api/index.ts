import ApiService, { withAPI } from "@workspace/flowtrove/lib/network"
import type { SignUpSchema } from "./validations"
import type { Tokens, User } from "@workspace/flowtrove/types"



export interface SignUpResponseType {
    tokens?: Tokens,
    user?: User
    sessionId?: string
    error?: {
        field?: string
        message?: string
    }
}
export async function signUp(data: SignUpSchema) {
    return ApiService.fetchData<SignUpResponseType>({
        url: withAPI('/authorization/sign-up'),
        data: data
    })
}