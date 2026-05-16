import { useLocation } from "react-router"

const EditorPage = () => {
    const { pathname } = useLocation()

    return (
        <div>
            <h1>Editor: {pathname}</h1>
        </div>
    )
}

export default EditorPage