import type {BoardGame} from "../types.ts"

export default function Homepage({games}: { games: BoardGame[] }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem 0",
            margin: "1rem 5rem"
        }}
        >
            {games.length > 0 ? (
                games.filter(game => !game.isExpansion).map(game => (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "fit-content",
                        maxWidth: "240px",
                        textAlign: "center"
                    }} key={game.id}
                    >
                        <img src={game.imageUrl} alt={game.name}/>
                        <h3 style={{marginBottom: "0.5rem"}}>{game.name}</h3>
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
                ))
            ) : (
                <h1>Welcome to Board Game Party Planner</h1>
            )}
        </div>
    )
}
