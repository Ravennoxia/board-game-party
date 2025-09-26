import SignOut from "../pages/profile-page/components/SignOut.tsx"
import {Link} from "react-router-dom"
import {ROUTES} from "../global/constants.ts"
import "./Navbar.css"

export default function Navbar() {
    return (
        <div className={"nav-container"}>
            <div>
                <Link to={ROUTES.home}>
                    <button>Home</button>
                </Link>
            </div>
            <div className={"button-spacing"}>
                <Link to={ROUTES.profile}>
                    <button>Profile</button>
                </Link>
                <SignOut/>
            </div>
        </div>
    )
}
