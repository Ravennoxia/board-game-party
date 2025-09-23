import {initializeApp} from "firebase/app"
import "./App.css"
import "./index.css"
import {useEffect, useState} from "react"
import {type Auth, getAuth, onAuthStateChanged} from "firebase/auth"
import {doc, Firestore, getDoc, getFirestore, setDoc} from "firebase/firestore"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import {BASE_NAME, FIREBASE_CONFIG, ROUTES} from "./features/constants.ts"
import type {BGUser} from "./features/types.ts"
import ProfilePage from "./features/user/ProfilePage.tsx"
import Navbar from "./features/Navbar.tsx"
import Homepage from "./features/Homepage.tsx"
import SignIn from "./features/user/SignIn.tsx"

export default function App() {
    const [bgUser, setBgUser] = useState<BGUser | null>(null)
    const [auth, setAuth] = useState<Auth | null>(null)
    const [db, setDb] = useState<Firestore | null>(null)

    useEffect(() => {
        try {
            const app = initializeApp(FIREBASE_CONFIG)
            const authInstance = getAuth(app)
            const dbInstance = getFirestore(app)
            setAuth(authInstance)
            setDb(dbInstance)

            const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
                if (currentUser) {
                    try {
                        const userDocRef = doc(dbInstance, "users", currentUser.uid)
                        const userDocSnap = await getDoc(userDocRef)
                        if (userDocSnap.exists()) {
                            const userData = userDocSnap.data() as BGUser
                            setBgUser(userData)
                        } else {
                            const newUserData = {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: currentUser.displayName,
                                photoURL: currentUser.photoURL,
                                createdAt: new Date()
                            }
                            await setDoc(userDocRef, newUserData, {merge: true})
                            setBgUser(newUserData)
                        }
                    } catch (e) {
                        console.error("Error setting user profile in Firestore:", e)
                    }
                } else {
                    setBgUser(null)
                }
            })

            return () => unsubscribe()
        } catch (e) {
            console.error("Firebase initialization failed:", e)
        }
    }, [])


    return (
        <BrowserRouter basename={BASE_NAME}>
            {bgUser ? (
                <div className={"app-div"}>
                    <Navbar bgUser={bgUser} auth={auth}/>
                    <Routes>
                        <Route path={ROUTES.home} element={<Homepage/>}/>
                        <Route path={ROUTES.profile} element={<ProfilePage bgUser={bgUser} db={db}/>}/>
                    </Routes>
                </div>
            ) : (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <h1>Welcome to Board Game Party Planner</h1>
                    <SignIn auth={auth}/>
                </div>

            )}

        </BrowserRouter>
    )
}
