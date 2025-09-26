import {collection, doc, getDoc, getDocs, query, where} from "firebase/firestore"
import type {BGUser, BoardGame} from "./types.ts"
import {DB_TABLES} from "./constants.ts"
import {dbInstance} from "./firebase.ts"

export async function fetchUsersGamesFromFirestore(uid: string) {
    const userData = await fetchUserFromFirestore(uid)
    if (!userData) {
        console.error("Could not fetch user data from Firestore")
        return []
    }
    const gameIds = userData.gameIds || []
    if (gameIds.length === 0) {
        console.log("User has no games saved")
        return []
    }
    const chunks: number[][] = []
    for (let i = 0; i < gameIds.length; i += 10) {
        chunks.push(gameIds.slice(i, i + 10))
    }
    const boardGamesColRef = collection(dbInstance, DB_TABLES.boardGames)
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
                id: gameData.id
            })
        })
    })
    return allGames
}

async function fetchUserFromFirestore(uid: string) {
    const userDocRef = doc(dbInstance, DB_TABLES.users, uid)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
        console.error(`User not found for UID: ${uid}`)
        return null
    }
    return userDocSnap.data() as BGUser
}

export async function getXMLDoc(response: Response) {
    const xmlText = await response.text()
    const parser = new DOMParser()
    return (parser.parseFromString(xmlText, "text/xml"))
}

export function getIntAttributeFromXML(el: Element | undefined, attr: string) {
    const parsed = parseInt(el?.getAttribute(attr) ?? "")
    return isNaN(parsed) ? 0 : parsed
}
