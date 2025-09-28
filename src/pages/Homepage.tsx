import {useApp} from "../global/AppContext.ts"
import "./Homepage.css"
import * as React from "react"
import {type Dispatch, type SetStateAction, useMemo, useState} from "react"
import {Cross2Icon} from "@radix-ui/react-icons"
import type {BoardGame} from "../global/types.ts"

const URL_BASE = "https://boardgamegeek.com/boardgame/"

export default function Homepage({showFilters}: { showFilters: boolean }) {
    const {games} = useApp()
    const [showExpansions, setShowExpansions] = useState<boolean>(false)
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | undefined>(undefined)
    const [playTime, setPlayTime] = useState<number | undefined>(undefined)

    function blockENotationKeys(e: React.KeyboardEvent<HTMLInputElement>) {
        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault()
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

    const visibleGames = useMemo(() => {
        const filteredGames = [...games]
        return filteredGames
            .filter((game) => (showExpansions || !game.isExpansion))
            .filter((game) => (numberOfPlayers === undefined || game.minPlayers <= numberOfPlayers && game.maxPlayers >= numberOfPlayers))
            .filter((game) => (playTime === undefined || game.minPlaytime <= playTime && game.maxPlaytime >= playTime))
    }, [games, numberOfPlayers, playTime, showExpansions])

    return (
        <div className={"homepage-container"}>
            {showFilters && (
                <div className={"filters-container"}>
                    <label className={"filter-label"}>
                        Show expansions:
                        <input className={"filter-checkbox"}
                               type={"checkbox"}
                               checked={showExpansions}
                               onChange={(e) => setShowExpansions(e.target.checked)}
                        />
                    </label>
                    <label className={"filter-label"}>
                        Number of players:
                        <input className={"input-field"}
                               style={{width: "30px"}}
                               type={"number"}
                               inputMode={"numeric"}
                               value={numberOfPlayers ?? ""}
                               onKeyDown={blockENotationKeys}
                               onInput={(e) => sanitizeNumber(e, 99, setNumberOfPlayers)}
                        />
                        <button className={"cancel-button"} onClick={() => setNumberOfPlayers(undefined)}><Cross2Icon/>
                        </button>
                    </label>
                    <label className={"filter-label"}>
                        Playtime (mins):
                        <input className={"input-field"}
                               style={{width: "40px"}}
                               type={"number"}
                               inputMode={"numeric"}
                               value={playTime ?? ""}
                               onKeyDown={blockENotationKeys}
                               onInput={(e) => sanitizeNumber(e, 999, setPlayTime)}
                        />
                        <button className={"cancel-button"} onClick={() => setPlayTime(undefined)}><Cross2Icon/>
                        </button>
                    </label>
                </div>
            )}
            {games.length > 0 ? (
                <div className={"games-container"}>
                    {visibleGames.map(game => (
                        <div className={"game-card"} key={game.id}>
                            <a style={{color: "inherit"}}
                               href={URL_BASE + game.id}
                               target="_blank"
                               rel="noopener noreferrer">
                                <img src={game.imageUrl} alt={game.name}/>
                                <h3 style={{marginBottom: "0.5rem"}}>{game.name}</h3>
                            </a>
                            {game.minPlayers === game.maxPlayers ? (
                                <div>Players: {game.maxPlayers}</div>
                            ) : (
                                <div>Players: {game.minPlayers} - {game.maxPlayers}</div>
                            )}
                            {game.minPlaytime === game.maxPlaytime ? (
                                <div>Playtime: {game.maxPlaytime} min</div>
                            ) : (
                                <div>Playtime: {game.minPlaytime} - {game.maxPlaytime} min</div>
                            )}
                            {game.expansions.length > 0 && !game.isExpansion && (
                                <ExpansionsForGame game={game} games={games}/>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <h1>Welcome to Board Game Party Planner</h1>
            )}
        </div>
    )
}

function ExpansionsForGame({game, games}: { game: BoardGame, games: BoardGame[] }) {
    const expansions = games.filter(g => game.expansions.includes(g.id))
    if (expansions.length < 1) {
        return (
            <>
                {game.expansions.length > 0 && (
                    <div>Expansions available</div>
                )}
            </>
        )
    }
    return (
        <>
            <div style={{fontWeight: "bold"}}>Expansions:</div>
            {expansions.map(g => (
                <a key={g.id}
                   style={{color: "inherit", fontWeight: "normal"}}
                   href={URL_BASE + g.id}
                   target="_blank"
                   rel="noopener noreferrer"
                >
                    {g.name}
                </a>
            ))}
        </>
    )
}
