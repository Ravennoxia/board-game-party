import {Cross2Icon} from "@radix-ui/react-icons"
import * as React from "react"
import {type Dispatch, type SetStateAction} from "react"
import type {SortOptions} from "./Homepage.tsx"

export interface FilterState {
    showExpansions: boolean
    setShowExpansions: Dispatch<SetStateAction<boolean>>
    numberOfPlayers: number | undefined
    setNumberOfPlayers: Dispatch<SetStateAction<number | undefined>>
    playTime: number | undefined
    setPlayTime: Dispatch<SetStateAction<number | undefined>>
    sortBy: SortOptions
    setSortBy: Dispatch<SetStateAction<SortOptions>>
}

export default function Filters({showFilters, filterState}: { showFilters: boolean, filterState: FilterState }) {
    function blockENotationKeys(e: React.KeyboardEvent<HTMLInputElement>) {
        const k = e.key
        if (["e", "E", "+", "-"].includes(k) || (k.length === 1 && !/^\d$/.test(k))) {
            e.preventDefault()
        }
    }

    function sanitizeNumber(e: React.FormEvent<HTMLInputElement>, max: number, setter: Dispatch<SetStateAction<number | undefined>>) {
        const digits = e.currentTarget.value.replace(/\D/g, "").replace(/^0(?=\d)/, "")
        let digitsNumber = Number(digits)
        if (digits && !isNaN(digitsNumber)) {
            if (digitsNumber > max) digitsNumber = max
            if (digitsNumber < 1) digitsNumber = 1
            setter(digitsNumber)
            return
        }
        setter(undefined)
    }

    return (
        <>
            {showFilters && (
                <div className={"filters-container"}>
                    <label className={"filter-label"}>
                        Show expansions:
                        <input className={"filter-checkbox"}
                               type={"checkbox"}
                               checked={filterState.showExpansions}
                               onChange={(e) => filterState.setShowExpansions(e.target.checked)}
                        />
                    </label>
                    <label className={"filter-label"}>
                        Number of players:
                        <input className={"input-field"}
                               style={{width: "35px"}}
                               type={"number"}
                               inputMode={"numeric"}
                               value={filterState.numberOfPlayers ?? ""}
                               onKeyDown={blockENotationKeys}
                               onInput={(e) => sanitizeNumber(e, 99, filterState.setNumberOfPlayers)}
                        />
                        <button className={"cancel-button"} onClick={() => filterState.setNumberOfPlayers(undefined)}>
                            <Cross2Icon/>
                        </button>
                    </label>
                    <label className={"filter-label"}>
                        Playtime (mins):
                        <input className={"input-field"}
                               style={{width: "45px"}}
                               type={"number"}
                               inputMode={"numeric"}
                               value={filterState.playTime ?? ""}
                               onKeyDown={blockENotationKeys}
                               onInput={(e) => sanitizeNumber(e, 999, filterState.setPlayTime)}
                        />
                        <button className={"cancel-button"} onClick={() => filterState.setPlayTime(undefined)}>
                            <Cross2Icon/>
                        </button>
                    </label>
                </div>
            )}
        </>
    )
}
