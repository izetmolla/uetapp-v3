import ApiService, { withAPI } from "@workspace/flowtrove/lib/network"
import type { SignInSchema } from "./validations"
import type { Confirmation, Tokens, User } from "@workspace/flowtrove/types"

export interface SignInResponseType {
    tokens?: Tokens,
    user?: User
    session_id?: string
    error?: {
        field?: string
        message?: string
    }
    confirmation?: Confirmation
}
export async function signIn(data: SignInSchema) {
    return ApiService.fetchData<SignInResponseType>({
        url: withAPI(data.checkEmail ? '/authorization/check-email' : '/authorization/sign-in'),
        method: 'post',
        data
    })
}


export async function checkTrustedDevice(session_id: string) {
    return ApiService.fetchData<SignInResponseType>({
        url: withAPI(`/authorization/check-trusted-device`),
        method: 'POST',
        data: {
            session_id
        }
    })
}