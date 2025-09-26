import {type FirebaseApp, getApp, getApps, initializeApp} from "firebase/app"
import {FIREBASE_CONFIG} from "./constants.ts"
import {getFirestore} from "firebase/firestore"
import {getAuth} from "firebase/auth"

let app: FirebaseApp
if (!getApps().length) {
    app = initializeApp(FIREBASE_CONFIG)
} else {
    app = getApp()
}

export const authInstance = getAuth(app)
export const dbInstance = getFirestore(app)
