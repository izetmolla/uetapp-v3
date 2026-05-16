import i18n from "../../lib/i18n"
import { I18nextProvider as Ipv } from "react-i18next"


const I18NextProvider = ({ children }: { children: React.ReactNode }) => {
    return <Ipv i18n={i18n}>{children}</Ipv>
}

export default I18NextProvider