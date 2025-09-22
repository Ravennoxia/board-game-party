import {initializeApp} from "firebase/app"
import "./App.css"
import {useEffect, useState} from "react"
import {
    type Auth,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    type User
} from "firebase/auth"
import {doc, Firestore, getDoc, getFirestore, setDoc, setLogLevel} from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyDM9-NOmxOE-E5xLG0jaglmlG98Z1zRhRM",
    authDomain: "raven-board-game-party.firebaseapp.com",
    projectId: "raven-board-game-party",
    storageBucket: "raven-board-game-party.firebasestorage.app",
    messagingSenderId: "400848628410",
    appId: "1:400848628410:web:9357bba7f8c4dcc5bcb083",
    measurementId: "G-VXZ52R32MK"
}

export default function App() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [auth, setAuth] = useState<Auth | null>(null)
    const [db, setDb] = useState<Firestore | null>(null)

    async function handleSignIn() {
        setLoading(true)
        if (!auth) {
            setLoading(false)
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
            setLoading(false)
        }
    }

    async function handleSignOut() {
        try {
            if (auth) {
                await signOut(auth)
            }
        } catch (e) {
            console.error("Sign-out error:", e)
        }
    }

    useEffect(() => {
        try {
            setLogLevel("debug")
            const app = initializeApp(firebaseConfig)
            const authInstance = getAuth(app)
            const dbInstance = getFirestore(app)
            setAuth(authInstance)
            setDb(dbInstance)

            const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser)
                    try {
                        const userDocRef = doc(dbInstance, "users", currentUser.uid)
                        const userDocSnap = await getDoc(userDocRef)
                        if (!userDocSnap.exists()) {
                            await setDoc(userDocRef, {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: currentUser.displayName,
                                photoURL: currentUser.photoURL,
                                createdAt: new Date()
                            }, {merge: true})
                        }
                    } catch (e) {
                        console.error("Error setting user profile in Firestore:", e)
                    }
                } else {
                    setUser(null)
                }
                setLoading(false)
            })

            return () => unsubscribe()
        } catch (e) {
            console.error("Firebase initialization failed:", e)
            setLoading(false)
        }
    }, [])

    return (
        <>
            {loading && !user && (
                <p>Loading...</p>
            )}
            {user ? (
                <>
                    <p>Welcome {user.displayName}</p>
                    <button onClick={handleSignOut}>Sign Out</button>
                </>
            ) : (
                <button onClick={handleSignIn}>Sign In</button>
            )}
        </>
    )
}
