import {type Auth, signOut} from "firebase/auth"

export default function SignOut({auth}: { auth: Auth | null }) {
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
