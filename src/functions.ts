import {collection, doc, type Firestore, getDoc, getDocs, query, where} from "firebase/firestore"
import type {BGUser, BoardGame} from "./types.ts"
import {DB_TABLES} from "./constants.ts"

export async function fetchGamesFromFirestore(uid: string | undefined, db: Firestore | null) {
    if (!uid || !db) {
        console.error("Missing user ID or DB.")
        return []
    }
    const userDocRef = doc(db, DB_TABLES.users, uid)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
        console.error(`User not found for UID: ${uid}`)
        return []
    }
    const userData = userDocSnap.data() as BGUser
    const gameIds = userData.gameIds || []
    if (gameIds.length === 0) {
        console.log("User has no games saved.")
        return []
    }
    const chunks: number[][] = []
    for (let i = 0; i < gameIds.length; i += 10) {
        chunks.push(gameIds.slice(i, i + 10))
    }
    const boardGamesColRef = collection(db, DB_TABLES.boardGames)
    const queryPromises = chunks.map(chunk => {
        const q = query(boardGamesColRef, where("id", "in", chunk))
        return getDocs(q)
    })
    const querySnapshots = await Promise.all(queryPromises)
    const allGames: BoardGame[] = []
    querySnapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
            const gameData = doc.data() as BoardGame
            allGames.push({
                ...gameData,
                id: parseInt(doc.id)
            })
        })
    })
    return allGames
}
