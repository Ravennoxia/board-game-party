import "./ProfilePage.css"
import {useState} from "react"
import {doc, updateDoc} from "firebase/firestore"
import {CheckIcon, Cross1Icon, Pencil1Icon} from "@radix-ui/react-icons"
import {useForm} from "react-hook-form"
import ImportGames from "./components/ImportGames.tsx"
import {DB_TABLES} from "../../global/constants.ts"
import {dbInstance} from "../../global/firebase.ts"
import {useApp} from "../../components/AppContext.ts"

type UsernameFormValues = {
    username: string
}

type BGGUsernameFormValues = {
    bggUsername: string
}

export default function ProfilePage() {
    const {user, setUser} = useApp()
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
            if (user && user.username !== data.username) {
                const userDocRef = doc(dbInstance, DB_TABLES.users, user.uid)
                await updateDoc(userDocRef, {username: data.username})
                setUser({...user, username: data.username})
            }
            setEditingUsername(false)
            resetUsername(data)
        } catch (e) {
            console.error("Error saving username:", e)
        }
    }

    async function saveBGGUsername(data: BGGUsernameFormValues) {
        try {
            if (user && user.bggUsername !== data.bggUsername) {
                const userDocRef = doc(dbInstance, DB_TABLES.users, user.uid)
                await updateDoc(userDocRef, {bggUsername: data.bggUsername})
                setUser({...user, bggUsername: data.bggUsername})
            }
            setEditingBGGUsername(false)
            resetBGGUsername(data)
        } catch (e) {
            console.error("Error saving BGG username:", e)
        }
    }

    return (
        <div className={"profile-container"}>
            <h2 className={"profile-name-image"}>
                {user?.photoURL && (
                    <img className={"profile-image"}
                         src={user.photoURL}
                         alt={user.displayName ?? "user"}
                         onError={e => e.currentTarget.src = "/icon.png"}
                    />
                )}
                {user?.displayName}
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
                                    defaultValue={user?.username}
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
                                <button className={"profile-button"} onClick={() => setEditingUsername(false)}>
                                    <Cross1Icon/>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>{user?.username}</div>
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
                                    defaultValue={user?.bggUsername}
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
                                <button className={"profile-button"}
                                        onClick={() => setEditingBGGUsername(false)}
                                >
                                    <Cross1Icon/>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>{user?.bggUsername}</div>
                            <button className={"profile-button"} onClick={editBGGUsername}><Pencil1Icon/>
                            </button>
                        </>
                    )}
                </form>
            </div>
            <ImportGames/>
        </div>
    )
}
