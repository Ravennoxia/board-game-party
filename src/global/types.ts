export interface BGUser {
    readonly uid: string
    readonly email: string | null
    readonly displayName: string | null
    readonly photoURL: string | null
    readonly createdAt: Date
    username: string
    bggUsername: string
    gameIds: number[]
    friends: string[]
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
