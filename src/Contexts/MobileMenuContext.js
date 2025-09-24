import { createContext, useState } from "react";

export const MobileMenuContext = createContext()

export default function MobileMenuProvider({ children }) {
    const [isShowSidebar, setIsShowSidebar] = useState(false)

    const mobileMenuClickHandler = () => {
        setIsShowSidebar(prev => !prev)
    }

    return (
        < MobileMenuContext.Provider value={{
            isShowSidebar,
            setIsShowSidebar,
            mobileMenuClickHandler
        }} >
            {children}
        </ MobileMenuContext.Provider>
    )
}