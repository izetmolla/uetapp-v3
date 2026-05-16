import { Link } from "react-router";


const Links = () => {
    return (
        <div className="flex justify-start gap-6 text-sm">
            <Link to="#" className="text-gray-500 hover:text-gray-700">Help</Link>
            <Link to="#" className="text-gray-500 hover:text-gray-700">Privacy</Link>
            <Link to="#" className="text-gray-500 hover:text-gray-700">Terms</Link>
        </div>
    )
}

export default Links;