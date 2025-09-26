import {defineConfig} from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig(({command}) => {
    return {
        plugins: [react()],
        base: command === "build" ? "/board-game-party/" : "/",
        server: {
            proxy: {
                "/xmlapi": {
                    target: "https://boardgamegeek.com",
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path.replace(/^\/xmlapi/, "/xmlapi")
                }
            }
        }
    }
})
