import {type Auth, GoogleAuthProvider, signInWithPopup} from "firebase/auth"

export default function SignIn({auth}: { auth: Auth | null }) {
    async function handleSignIn() {
        if (!auth) {
            return
        }
        try {
            const provider = new GoogleAuthProvider()
            provider.setCustomParameters({
                prompt: "select_account"
            })
            await signInWithPopup(auth, provider)
        } catch (e) {
            console.error("Sign-in error:", e)
        }
    }

    return (
        <button onClick={handleSignIn}>Sign In</button>
    )
}
