import {signOut} from "firebase/auth"
import {useApp} from "../../../components/AppContext.ts"

export default function SignOut() {
    const {auth} = useApp()

    async function handleSignOut() {
        try {
            if (auth) {
                await signOut(auth)
            }
        } catch (e) {
            console.error("Sign-out error:", e)
        }
    }

    return (
        <button onClick={handleSignOut}>Sign Out</button>
    )
}
