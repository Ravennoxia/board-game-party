import type {BGUser} from "../types.ts"
import "./ProfilePage.css"
import {type Dispatch, type SetStateAction, useState} from "react"
import {doc, type Firestore, updateDoc} from "firebase/firestore"
import {CheckIcon, Cross1Icon, Pencil1Icon} from "@radix-ui/react-icons"
import {useForm} from "react-hook-form"

type UsernameFormValues = {
    username: string
}

type BGGUsernameFormValues = {
    bggUsername: string
}

export default function ProfilePage({bgUser, setBgUser, db}: {
    bgUser: BGUser | null,
    setBgUser: Dispatch<SetStateAction<BGUser | null>>,
    db: Firestore | null
}) {
    const [editingUsername, setEditingUsername] = useState<boolean>(false)
    const [editingBGGUsername, setEditingBGGUsername] = useState<boolean>(false)

    const {
        handleSubmit: handleSubmitUsername,
        register: registerUsername,
        reset: resetUsername,
        formState: {errors: errorsUsername}
    } = useForm<UsernameFormValues>({mode: "onChange"})
    const {
        handleSubmit: handleSubmitBGGUsername,
        register: registerBGGUsername,
        reset: resetBGGUsername,
        formState: {errors: errorsBGGUsername}
    } = useForm<BGGUsernameFormValues>({mode: "onChange"})

    function editUsername() {
        setEditingUsername(true)
    }

    function editBGGUsername() {
        setEditingBGGUsername(true)
    }

    async function saveUsername(data: UsernameFormValues) {
        try {
            if (db && bgUser && bgUser.username !== data.username) {
                const userDocRef = doc(db, "users", bgUser.uid)
                await updateDoc(userDocRef, {username: data.username})
                setBgUser({...bgUser, username: data.username})
            }
            setEditingUsername(false)
            resetUsername(data)
        } catch (e) {
            console.error("Error saving username:", e)
        }
    }

    async function saveBGGUsername(data: BGGUsernameFormValues) {
        try {
            if (db && bgUser && bgUser.bggUsername !== data.bggUsername) {
                const userDocRef = doc(db, "users", bgUser.uid)
                await updateDoc(userDocRef, {bggUsername: data.bggUsername})
                setBgUser({...bgUser, bggUsername: data.bggUsername})
            }
            setEditingBGGUsername(false)
            resetBGGUsername(data)
        } catch (e) {
            console.error("Error saving BGG username:", e)
        }
    }

    return (
        <div className={"profile-page"}>
            {bgUser ? (
                <>
                    <h2 className={"profile-name-image"}>
                        {bgUser.photoURL && (
                            <img className={"profile-image"}
                                 src={bgUser.photoURL}
                                 alt={"Photo of " + bgUser.displayName}
                            />
                        )}
                        {bgUser.displayName}
                    </h2>
                    <div>
                        <form className={"profile-grid"} onSubmit={handleSubmitUsername(saveUsername)}>
                            <label className={"field-name"} htmlFor={"username"}>Username:</label>
                            {editingUsername ? (
                                <>
                                    <div>
                                        <div className={"field-error-placeholder"}>
                                            {errorsUsername.username && (
                                                <div className={"field-error"}>{errorsUsername.username.message}</div>
                                            )}
                                        </div>
                                        <input
                                            id={"username"}
                                            className={"field-input"}
                                            type={"text"}
                                            defaultValue={bgUser.username}
                                            {...registerUsername("username", {
                                                maxLength: {
                                                    value: 20,
                                                    message: "max 20 characters"
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className={"field-buttons"}>
                                        <button className={"profile-button"} type={"submit"}><CheckIcon/></button>
                                        <button className={"profile-button"} onClick={() => resetUsername()}>
                                            <Cross1Icon/>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>{bgUser.username}</div>
                                    <button className={"profile-button"} onClick={editUsername}><Pencil1Icon/></button>
                                </>
                            )}
                        </form>
                        <form className={"profile-grid"} onSubmit={handleSubmitBGGUsername(saveBGGUsername)}>
                            <label className={"field-name"}
                                   htmlFor={"bggUsername"}
                            >
                                BoardGameGeek <br/> Username:
                            </label>
                            {editingBGGUsername ? (
                                <>
                                    <div>
                                        <div className={"field-error-placeholder"}>
                                            {errorsBGGUsername.bggUsername && (
                                                <div
                                                    className={"field-error"}
                                                >
                                                    {errorsBGGUsername.bggUsername.message}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id={"bggUsername"}
                                            className={"field-input"}
                                            type={"text"}
                                            defaultValue={bgUser.bggUsername}
                                            {...registerBGGUsername("bggUsername", {
                                                maxLength: {
                                                    value: 20,
                                                    message: "max 20 characters"
                                                }, pattern: {
                                                    value: /^\w+$/,
                                                    message: "unsupported characters"
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className={"field-buttons"}>
                                        <button className={"profile-button"} type={"submit"}><CheckIcon/></button>
                                        <button className={"profile-button"} onClick={() => resetBGGUsername()}>
                                            <Cross1Icon/>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>{bgUser.bggUsername}</div>
                                    <button className={"profile-button"} onClick={editBGGUsername}><Pencil1Icon/>
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </>
            ) : (
                <></>
            )}
        </div>
    )
}
