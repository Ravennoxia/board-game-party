export interface BGUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL?: string | null
    createdAt?: Date
    username?: string
    bggUsername?: string
}
