import SignIn from "./user/SignIn.tsx"
import type {BGUser} from "./types.ts"
import SignOut from "./user/SignOut.tsx"
import type {Auth} from "firebase/auth"
import {Link} from "react-router-dom"
import {ROUTES} from "./constants.ts"
import "./Navbar.css"

export default function Navbar({bgUser, auth}: { bgUser: BGUser | null, auth: Auth | null }) {
    return (
        <div className={"nav-div"}>
            {bgUser ? (
                <>
                    <Link to={ROUTES.profile}>
                        <button>Profile</button>
                    </Link>
                    <SignOut auth={auth}/>
                </>
            ) : (
                <SignIn auth={auth}/>
            )}

        </div>
    )
}
