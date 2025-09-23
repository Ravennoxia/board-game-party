import type {BGUser} from "../types.ts"
import "./ProfilePage.css"
import {useEffect, useState} from "react"
import {doc, type Firestore, updateDoc} from "firebase/firestore"

export default function ProfilePage({bgUser, db}: { bgUser: BGUser | null, db: Firestore | null }) {
    const [currentUserName, setCurrentUserName] = useState<string>("")
    const [currentBGGUsername, setCurrentBGGUsername] = useState<string>("")
    const [editingUsername, setEditingUsername] = useState<boolean>(false)
    const [editingBGGUsername, setEditingBGGUsername] = useState<boolean>(false)

    function editUsername() {
        setEditingUsername(true)
    }

    function editBGGUsername() {
        setEditingBGGUsername(true)
    }

    async function saveUsername() {
        try {
            if (db && bgUser) {
                const userDocRef = doc(db, "users", bgUser.uid)
                await updateDoc(userDocRef, {username: currentUserName})
                setEditingUsername(false)
            }
        } catch (e) {
            console.error("Error saving username:", e)
        }
    }

    async function saveBGGUsername() {
        try {
            if (db && bgUser) {
                const userDocRef = doc(db, "users", bgUser.uid)
                await updateDoc(userDocRef, {bggUsername: currentBGGUsername})
                setEditingBGGUsername(false)
            }
        } catch (e) {
            console.error("Error saving username:", e)
        }
    }

    useEffect(() => {
        if (bgUser?.username) {
            setCurrentUserName(bgUser.username)
        }
        if (bgUser?.bggUsername) {
            setCurrentBGGUsername(bgUser.bggUsername)
        }
    }, [bgUser?.bggUsername, bgUser?.username])

    return (
        <div className={"profile-page"}>
            {bgUser ? (
                <>
                    <h2 className={"profile-name-image"}>
                        {bgUser.photoURL && (
                            <img className={"profile-image"} src={bgUser.photoURL}
                                 alt={"Photo of " + bgUser.displayName}/>
                        )}
                        {bgUser.displayName}
                    </h2>
                    <div className={"profile-grid"}>
                        <div className={"field-name"}>
                            Username:
                        </div>
                        <input
                            type={"text"}
                            value={currentUserName}
                            onChange={(e) => setCurrentUserName(e.target.value)}
                            disabled={!editingUsername}/>
                        {editingUsername ? (
                            <button onClick={saveUsername}>Save</button>
                        ) : (
                            <button onClick={editUsername}>Edit</button>
                        )}
                        <div className={"field-name"}>
                            BoardGameGeek <br/> Username:
                        </div>
                        <input
                            type={"text"}
                            value={currentBGGUsername}
                            onChange={(e) => setCurrentBGGUsername(e.target.value)}
                            disabled={!editingBGGUsername}/>
                        {editingBGGUsername ? (
                            <button onClick={saveBGGUsername}>Save</button>
                        ) : (
                            <button onClick={editBGGUsername}>Edit</button>
                        )}

                    </div>
                </>
            ) : (
                <></>
            )}
        </div>
    )
}
