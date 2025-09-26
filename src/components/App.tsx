import "./App.css"
import "../index.css"
import {HashRouter, Route, Routes} from "react-router-dom"
import {ROUTES} from "../global/constants.ts"
import ProfilePage from "../pages/profile-page/ProfilePage.tsx"
import Navbar from "./Navbar.tsx"
import Homepage from "../pages/Homepage.tsx"
import SignIn from "../pages/profile-page/components/SignIn.tsx"
import {useApp} from "../global/AppContext.ts"

export default function App() {
    const {user} = useApp()

    return (
        <HashRouter>
            {user ? (
                <div className={"app-container"}>
                    <Navbar/>
                    <Routes>
                        <Route path={ROUTES.home} element={<Homepage/>}/>
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
