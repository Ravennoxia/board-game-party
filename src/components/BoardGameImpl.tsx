import type {BoardGame} from "../types.ts"

function getIntAttribute(el: Element | undefined, attr: string) {
    const parsed = parseInt(el?.getAttribute(attr) ?? "")
    return isNaN(parsed) ? 0 : parsed
}

function getFloatAttribute(el: Element | undefined, attr: string) {
    const parsed = parseFloat(el?.getAttribute(attr) ?? "")
    return isNaN(parsed) ? 0 : parsed
}

export function getElement(el: Element | undefined, tag: string) {
    return el?.getElementsByTagName(tag)[0]
}

// noinspection SpellCheckingInspection
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

    static fromXMLElement(item: Element) {
        const stats = getElement(item, "stats")
        const parsedData: BoardGame = {
            id: getIntAttribute(item, "objectid"),
            name: getElement(item, "name")?.textContent ?? "???",
            imageUrl: getElement(item, "thumbnail")?.textContent ?? "",
            isExpansion: false,
            rating: getFloatAttribute(getElement(getElement(stats, "rating"), "bayesaverage"), "value"),
            minPlayers: getIntAttribute(stats, "minplayers"),
            maxPlayers: getIntAttribute(stats, "maxplayers"),
            minPlaytime: getIntAttribute(stats, "minplaytime"),
            maxPlaytime: getIntAttribute(stats, "maxplaytime"),
            types: [],
            categories: [],
            mechanisms: [],
            expansions: []
        }
        return new BoardGameImpl(parsedData)
    }

    async fetchDetails() {
        try {
            const response = await fetch("/xmlapi/boardgame/" + this.id)
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`)
            }
            const xmlText = await response.text()
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xmlText, "text/xml")
            const item = xmlDoc.getElementsByTagName("boardgame")[0]

            if (item) {
                this.isExpansion = Array.from(item.getElementsByTagName("boardgameexpansion")).some(el => el.getAttribute("inbound") === "true")
                this.types = Array.from(item.getElementsByTagName("boardgamesubdomain")).map(el => el.textContent ?? "")
                this.categories = Array.from(item.getElementsByTagName("boardgamecategory")).map(el => el.textContent ?? "")
                this.mechanisms = Array.from(item.getElementsByTagName("boardgamemechanic")).map(el => el.textContent ?? "")
                this.expansions = Array.from(item.getElementsByTagName("boardgameexpansion")).map(el => getIntAttribute(el, "objectid"))
            }
        } catch (e) {
            console.error(`Error fetching details for game ${this.name}:`, e)
        }

        return this
    }
}
