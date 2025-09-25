export interface BGUser {
    uid: string
    email: string | null
    displayName: string | null
    photoURL?: string | null
    createdAt?: Date
    username?: string
    bggUsername?: string
    gameIds?: number[]
    friends?: string[]
}

export interface BoardGame {
    id: number
    name: string
    imageUrl: string
    isExpansion: boolean
    rating: number
    minPlayers: number
    maxPlayers: number
    minPlaytime: number
    maxPlaytime: number
    types: string[]
    categories: string[]
    mechanisms: string[]
    expansions: number[]
}
