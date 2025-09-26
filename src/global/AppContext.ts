import type {Auth} from "firebase/auth"
import type {Firestore} from "firebase/firestore"
import type {BGUser, BoardGame} from "./types.ts"
import {createContext, type Dispatch, type SetStateAction, useContext} from "react"

export interface AppContextType {
    auth: Auth
    db: Firestore
    user: BGUser | null
    setUser: Dispatch<SetStateAction<BGUser | null>>
    games: BoardGame[]
    setGames: Dispatch<SetStateAction<BoardGame[]>>
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider")
    }
    return context
}
