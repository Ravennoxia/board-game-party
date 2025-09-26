import type {BoardGame} from "./types.ts"
import {getIntAttributeFromXML, getXMLDoc} from "./functions.ts"

export default class BoardGameImpl implements BoardGame {
    id!: number
    name!: string
    imageUrl!: string
    isExpansion!: boolean
    rating!: number
    minPlayers!: number
    maxPlayers!: number
    minPlaytime!: number
    maxPlaytime!: number
    types!: string[]
    categories!: string[]
    mechanisms!: string[]
    expansions!: number[]

    constructor(data: BoardGame) {
        Object.assign(this, data)
    }

    static async createFromXML(collectionItem: Element) {
        const id = getIntAttributeFromXML(collectionItem, "objectid")
        if (id <= 0) {
            console.error("Invalid game ID")
            return null
        }
        const stats = getFirstElement(collectionItem, "stats")
        const partialItem: BoardGame = {
            id: id,
            name: getFirstElement(collectionItem, "name")?.textContent ?? "???",
            imageUrl: getFirstElement(collectionItem, "thumbnail")?.textContent ?? "",
            isExpansion: false,
            rating: getFloatAttribute(getFirstElement(getFirstElement(stats, "rating"), "bayesaverage"), "value"),
            minPlayers: getIntAttributeFromXML(stats, "minplayers"),
            maxPlayers: getIntAttributeFromXML(stats, "maxplayers"),
            minPlaytime: getIntAttributeFromXML(stats, "minplaytime"),
            maxPlaytime: getIntAttributeFromXML(stats, "maxplaytime"),
            types: [],
            categories: [],
            mechanisms: [],
            expansions: []
        }
        try {
            const response = await fetch(`/xmlapi/boardgame/${id}`)
            if (!response.ok) {
                console.error(`Could not fetch details for game ID ${id}. HTTP Error! Status: ${response.status}`)
                return new BoardGameImpl(partialItem)
            }
            const xmlDoc = await getXMLDoc(response)
            const bgItem = xmlDoc.getElementsByTagName("boardgame")[0]
            if (!bgItem) {
                console.error(`Could not fetch details for game ID ${id}`)
                return new BoardGameImpl(partialItem)
            }
            const fullParsedData: BoardGame = {
                ...partialItem,
                isExpansion: Array.from(bgItem.getElementsByTagName("boardgameexpansion")).some(el => el.getAttribute("inbound") === "true"),
                types: Array.from(bgItem.getElementsByTagName("boardgamesubdomain")).map(el => el.textContent ?? ""),
                categories: Array.from(bgItem.getElementsByTagName("boardgamecategory")).map(el => el.textContent ?? ""),
                mechanisms: Array.from(bgItem.getElementsByTagName("boardgamemechanic")).map(el => el.textContent ?? ""),
                expansions: Array.from(bgItem.getElementsByTagName("boardgameexpansion")).map(el => getIntAttributeFromXML(el, "objectid"))
            }
            return new BoardGameImpl(fullParsedData)
        } catch (e) {
            console.error("Could not fetch game data from BGG:", e)
            return new BoardGameImpl(partialItem)
        }
    }
}

function getFloatAttribute(el: Element | undefined, attr: string) {
    const parsed = parseFloat(el?.getAttribute(attr) ?? "")
    return isNaN(parsed) ? 0 : parsed
}

function getFirstElement(el: Element | undefined, tag: string) {
    return el?.getElementsByTagName(tag)[0]
}
