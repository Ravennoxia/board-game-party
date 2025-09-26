import type {BoardGame} from "../../../global/types.ts"
import {useState} from "react"
import {collection, doc, documentId, getDocs, query, updateDoc, where, writeBatch} from "firebase/firestore"
import {DB_TABLES} from "../../../global/constants.ts"
import {fetchUsersGamesFromFirestore, getIntAttributeFromXML, getXMLDoc} from "../../../global/functions.ts"
import {dbInstance} from "../../../global/firebase.ts"
import {useApp} from "../../../global/AppContext.ts"
import BoardGameImpl from "../../../global/boardGameImpl.ts"

export default function ImportGames() {
    const {user, setGames} = useApp()
    const [importing, setImporting] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function fetchGamesFromBGG() {
        setImporting(true)
        setErrorMessage(null)
        try {
            if (!user?.bggUsername) {
                console.log("No BoardGameGeek username")
                setErrorMessage("First set BGG username")
                return
            }
            const response = await fetch(`/xmlapi/collection/${user.bggUsername}?own=1`)
            if (!response.ok) {
                console.error(
                    `Could not fetch collection of ${user.bggUsername}. HTTP error! status: ${response.status}`)
                setErrorMessage(`HTTP error: ${response.status}`)
                return
            }
            const xmlDoc = await getXMLDoc(response)
            if (!checkValidUsername(xmlDoc)) return
            if (checkProcessing(xmlDoc)) return
            const items = xmlDoc.getElementsByTagName("item")
            const allGameIds: number[] = Array.from(items)
                .map(item => getIntAttributeFromXML(item, "objectid"))
                .filter(id => id > 0)
            const existingIds = await fetchExistingGameIdsFromFirestore(allGameIds) ?? new Set()
            const itemsToFetchDetailsFor = Array.from(items).filter(item => {
                const id = getIntAttributeFromXML(item, "objectid")
                return !existingIds.has(id)
            })
            const newParsedGames: BoardGameImpl[] = (await Promise.all(itemsToFetchDetailsFor
                .map(item => BoardGameImpl.createFromXML(item))))
                .filter((game): game is BoardGameImpl => game !== null)
            await saveNewGamesToFirestore(newParsedGames)
            await saveUsersGameIdsToFirestore(allGameIds)
            setGames(await fetchUsersGamesFromFirestore(user.uid))
        } catch (e) {
            console.error("Could not complete BGG import process:", e)
            setErrorMessage("Could not fetch games")
        } finally {
            setImporting(false)
        }
    }

    /**
     * Checks whether username is recognized by BGG API
     *
     * <errors>
     *     <error>
     *         <message>Invalid username specified</message>
     *     </error>
     * </errors>
     *
     * @param xmlDoc user's collection doc
     * @returns boolean
     */
    function checkValidUsername(xmlDoc: Document) {
        if (xmlDoc.getElementsByTagName("errors").length > 0) {
            setErrorMessage(xmlDoc
                .getElementsByTagName("errors")[0]
                ?.getElementsByTagName("error")[0]
                ?.getElementsByTagName("message")[0]
                ?.textContent)
            return false
        }
        return true
    }

    /**
     * Checks whether the request needs time to process
     *
     * <message> Your request for this collection has been accepted and will be processed. Please try again later for access. </message>
     *
     * @param xmlDoc user's collection doc
     * @returns boolean
     */
    function checkProcessing(xmlDoc: Document) {
        if (xmlDoc.getElementsByTagName("message").length > 0) {
            setErrorMessage(xmlDoc.getElementsByTagName("message")[0]?.textContent)
            return true
        }
        return false
    }

    async function saveNewGamesToFirestore(games: BoardGame[]) {
        if (games.length === 0) {
            console.log("No new games to add to database")
            return
        }
        const boardGamesColRef = collection(dbInstance, DB_TABLES.boardGames)
        const batch = writeBatch(dbInstance)
        games.forEach(game => {
            const docRef = doc(boardGamesColRef, String(game.id))
            batch.set(docRef, {...game})
        })
        try {
            await batch.commit()
        } catch (e) {
            console.error("Failed to save games to Firestore", e)
            setErrorMessage("Could not save new games")
        }
    }

    async function saveUsersGameIdsToFirestore(gameIds: number[]) {
        if (gameIds.length === 0) {
            console.log("User does not have any games")
            return
        }
        const userDocRef = doc(dbInstance, DB_TABLES.users, user!.uid)
        try {
            await updateDoc(userDocRef, {
                gameIds: gameIds
            })
        } catch (e) {
            console.error("Failed to save user's gameIds to Firestore:", e)
            setErrorMessage("Could not save user's games")
            throw new Error(`Failed to save user's gameIds to Firestore: ${e}`)
        }
    }

    return (
        <>
            <button onClick={fetchGamesFromBGG}>{importing ? "Importing..." : "Import Games"}</button>
            {errorMessage && (
                <div style={{color: "red"}}>{errorMessage}</div>
            )}
        </>
    )
}

async function fetchExistingGameIdsFromFirestore(usersGameIds: number[]): Promise<Set<number>> {
    if (usersGameIds.length === 0) {
        console.log("User does not have any games")
        return new Set()
    }
    const existingIds = new Set<number>()
    const chunks: number[][] = []
    for (let i = 0; i < usersGameIds.length; i += 10) {
        chunks.push(usersGameIds.slice(i, i + 10))
    }
    const boardGamesColRef = collection(dbInstance, DB_TABLES.boardGames)
    const queryPromises = chunks.map(chunk => {
        const q = query(boardGamesColRef, where(documentId(), "in", chunk.map(String)))
        return getDocs(q)
    })
    const snapshots = await Promise.all(queryPromises)
    snapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
            existingIds.add(Number(doc.id))
        })
    })
    return existingIds
}
