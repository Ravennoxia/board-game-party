import {type ReactNode, useEffect, useMemo, useState} from "react"
import type {BGUser, BoardGame} from "../global/types.ts"
import {onAuthStateChanged, type User} from "firebase/auth"
import {doc, getDoc, setDoc} from "firebase/firestore"
import {authInstance, dbInstance} from "../global/firebase.ts"
import {DB_TABLES} from "../global/constants.ts"
import {fetchUsersGamesFromFirestore} from "../global/functions.ts"
import {AppContext, type AppContextType} from "../global/AppContext.ts"

export default function AppProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<BGUser | null>(null)
    const [games, setGames] = useState<BoardGame[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!authInstance) {
            setLoading(false)
            return
        }
        const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
            if (currentUser) {
                try {
                    const fetchedUser = await fetchOrCreateUser(currentUser)
                    const loadedGames = await fetchUsersGamesFromFirestore(currentUser.uid)
                    setUser(fetchedUser)
                    setGames(loadedGames)
                } catch (e) {
                    console.error("Error setting user profile:", e)
                    setUser(null)
                    setGames([])
                }
            } else {
                setUser(null)
                setGames([])
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const contextValue: AppContextType = useMemo(() => ({
        auth: authInstance,
        db: dbInstance,
        user,
        setUser,
        games,
        setGames,
        loading,
        setLoading
    }), [games, loading, user])

    return (
        <AppContext.Provider value={contextValue}>
            {loading ? (
                <div className={"loader-container"}>
                    <h1>Loading...</h1>
                    <div className={"loader"}></div>
                </div>
            ) : (
                children
            )}
        </AppContext.Provider>
    )
}

async function fetchOrCreateUser(currentUser: User) {
    const userDocRef = doc(dbInstance, DB_TABLES.users, currentUser.uid)
    const userDocSnap = await getDoc(userDocRef)
    if (userDocSnap.exists()) {
        return userDocSnap.data() as BGUser
    }
    const newUserData: BGUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        createdAt: new Date(),
        username: "",
        bggUsername: "",
        gameIds: [],
        friends: []
    }
    await setDoc(userDocRef, newUserData, {merge: true})
    return newUserData
}
