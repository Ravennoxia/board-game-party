import "./App.css"
import "../index.css"
import {HashRouter, Route, Routes} from "react-router-dom"
import {ROUTES} from "../global/constants.ts"
import ProfilePage from "../pages/profile-page/ProfilePage.tsx"
import Navbar from "./Navbar.tsx"
import Homepage from "../pages/Homepage.tsx"
import SignIn from "../pages/profile-page/components/SignIn.tsx"
import {useApp} from "../global/AppContext.ts"
import {useState} from "react"

export default function App() {
    const {user} = useApp()
    const [showFilters, setShowFilters] = useState(false)
    return (
        <HashRouter>
            {user ? (
                <div className={"app-container"}>
                    <Navbar setShowFilters={setShowFilters}/>
                    <Routes>
                        <Route path={ROUTES.home} element={<Homepage showFilters={showFilters}/>}/>
                        <Route path={ROUTES.profile}
                               element={<ProfilePage/>}
                        />
                    </Routes>
                </div>
            ) : (
                <div className={"sign-in-container"}>
                    <h1>Welcome to Board Game Party Planner</h1>
                    <SignIn/>
                </div>

            )}
        </HashRouter>
    )
}
