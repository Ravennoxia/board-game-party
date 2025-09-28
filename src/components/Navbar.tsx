import SignOut from "../pages/profile-page/components/SignOut.tsx"
import {Link, useLocation} from "react-router-dom"
import {ROUTES} from "../global/constants.ts"
import "./Navbar.css"
import {type Dispatch, type SetStateAction, useEffect, useRef} from "react"

export default function Navbar({setShowFilters}: { setShowFilters: Dispatch<SetStateAction<boolean>> }) {
    const navRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const showFilterButton = location.pathname === ROUTES.home

    function handleFilterToggle() {
        setShowFilters(prevState => !prevState)
    }

    useEffect(() => {
        function update() {
            if (navRef.current) {
                document.documentElement.style.setProperty("--header-h", `${navRef.current.offsetHeight}px`)
            }
        }

        update()
        const ro = new ResizeObserver(update)
        if (navRef.current) ro.observe(navRef.current)
        return () => ro.disconnect()
    })

    return (
        <div ref={navRef} className={"nav-container"}>
            <div className={"button-spacing"}>
                <Link to={ROUTES.home}>
                    <button>Home</button>
                </Link>
                {showFilterButton && (
                    <button onClick={handleFilterToggle}>Filters</button>
                )}
            </div>
            <div className={"button-spacing"}>
                <Link to={ROUTES.profile}>
                    <button>Profile</button>
                </Link>
                <SignOut/>
            </div>
        </div>
    )
}
