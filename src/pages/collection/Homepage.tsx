import {useApp} from "../../global/AppContext.ts"
import "./Homepage.css"
import {useMemo, useState} from "react"
import type {BoardGame} from "../../global/types.ts"
import Filters, {type FilterState} from "./Filters.tsx"

const URL_BASE = "https://boardgamegeek.com/boardgame/"

export type SortOptions =
    "none"
    | "name-asc"
    | "name-desc"
    | "min-players"
    | "max-players"
    | "min-playtime"
    | "max-playtime"
    | "ranking-asc"
    | "ranking-desc"

export default function Homepage({showFilters}: { showFilters: boolean }) {
    const {games} = useApp()
    const [showExpansions, setShowExpansions] = useState<boolean>(false)
    const [numberOfPlayers, setNumberOfPlayers] = useState<number | undefined>(undefined)
    const [playTime, setPlayTime] = useState<number | undefined>(undefined)
    const [sortBy, setSortBy] = useState<SortOptions>("none")

    const filterState: FilterState = {
        showExpansions,
        setShowExpansions,
        numberOfPlayers,
        setNumberOfPlayers,
        playTime,
        setPlayTime,
        sortBy,
        setSortBy
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
            <Filters showFilters={showFilters} filterState={filterState}/>
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
