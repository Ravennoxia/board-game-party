import type {BGUser} from "../types.ts"
import SignOut from "../pages/profile-page/components/SignOut.tsx"
import type {Auth} from "firebase/auth"
import {Link} from "react-router-dom"
import {ROUTES} from "../constants.ts"
import "./Navbar.css"

export default function Navbar({bgUser, auth}: { bgUser: BGUser | null, auth: Auth | null }) {
    return (
        <>
            {bgUser && (
                <div className={"nav-div"}>
                    <div>
                        <Link to={ROUTES.home}>
                            <button>Home</button>
                        </Link>
                    </div>
                    <div className={"button-spacing"}>
                        <Link to={ROUTES.profile}>
                            <button>Profile</button>
                        </Link>
                        <SignOut auth={auth}/>
                    </div>
                </div>
            )}
        </>
    )
}
