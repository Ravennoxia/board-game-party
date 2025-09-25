import type {BoardGame} from "../../../types.ts"
import {type Dispatch, type SetStateAction, useState} from "react"
import BoardGameImpl from "../../../components/BoardGameImpl.tsx"
import {collection, doc, type Firestore, getDoc, writeBatch} from "firebase/firestore"
import {DB_TABLES} from "../../../constants.ts"
import {fetchGamesFromFirestore} from "../../../functions.ts"

export default function ImportGames({uid, bggUsername, setGames, db}: {
    uid: string,
    bggUsername: string | undefined,
    setGames: Dispatch<SetStateAction<BoardGame[]>>,
    db: Firestore | null
}) {
    const [loading, setLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function fetchGamesFromBGG() {
        setLoading(true)
        setErrorMessage(null)
        try {
            // noinspection SpellCheckingInspection
            const response = await fetch("/xmlapi/collection/" + bggUsername + "?own=1")
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`)
            }
            const xmlText = await response.text()
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xmlText, "text/xml")
            if (xmlDoc.getElementsByTagName("errors").length > 0) {
                // <errors>
                //     <error>
                //         <message>Invalid username specified</message>
                //     </error>
                // </errors>
                setErrorMessage(xmlDoc.getElementsByTagName("errors")[0]?.getElementsByTagName("error")[0]?.getElementsByTagName("message")[0]?.textContent)
                return
            }
            if (xmlDoc.getElementsByTagName("message").length > 0) {
                setErrorMessage(xmlDoc.getElementsByTagName("message")[0]?.textContent)
                return
            }
            const items = xmlDoc.getElementsByTagName("item")
            const parsedGames: BoardGameImpl[] = Array.from(items).map(item => (BoardGameImpl.fromXMLElement(item)))
            const populatedGames = await Promise.all(
                parsedGames.map(game => game.fetchDetails())
            )
            await saveGamesToFirestore(populatedGames)
            setGames(await fetchGamesFromFirestore(uid, db))
        } catch (e) {
            console.error("Could not fetch games from user collection:", e)
        } finally {
            setLoading(false)
        }
    }

    async function saveGamesToFirestore(games: BoardGame[]) {
        if (games.length === 0) {
            console.log("No games to save.")
            return
        }
        if (db) {
            const batch = writeBatch(db)
            const boardGamesColRef = collection(db, DB_TABLES.boardGames)
            const allGameIds: number[] = games.map(game => game.id)
            const existenceChecks = games.map(async game => {
                const docRef = doc(boardGamesColRef, String(game.id))
                const docSnap = await getDoc(docRef)
                return ({
                    game,
                    exists: docSnap.exists(),
                    docRef
                })
            })
            const results = await Promise.all(existenceChecks)
            results.forEach(({game, exists, docRef}) => {
                if (!exists) {
                    batch.set(docRef, {...game})
                }
            })
            const userDocRef = doc(db, DB_TABLES.users, uid)
            batch.update(userDocRef, {
                gameIds: allGameIds
            })
            try {
                await batch.commit()
            } catch (e) {
                console.error("Error committing games to Firestore: ", e)
            }
        } else {
            console.error("Firestore not found")
        }
    }

    return (
        <>
            <button onClick={fetchGamesFromBGG}>{loading ? "Importing..." : "Import Games"}</button>
            {errorMessage && (
                <div style={{color: "red"}}>{errorMessage}</div>
            )}
        </>
    )
}
