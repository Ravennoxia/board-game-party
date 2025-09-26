import {useApp} from "../global/AppContext.ts"
import "./Homepage.css"

const URL_BASE = "https://boardgamegeek.com/boardgame/"

export default function Homepage() {
    const {games} = useApp()
    return (
        <>
            {games.length > 0 ? (
                <div className={"games-container"}>
                    {games.filter(game => !game.isExpansion).map(game => (
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
                            {game.expansions.length > 0 && (
                                <div>Has expansions</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <h1>Welcome to Board Game Party Planner</h1>
            )}
        </>
    )
}
