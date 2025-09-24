import { createContext, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';

export const SearchContext = createContext()

export default function SearchProvider({ children }) {

    const [text, setText] = useState('')
    const [filteredDatas, setFilteredDatas] = useState([])
    const [datas, setDatas] = useState([])


    const setSearchSourceData  = (newDatas) => {
        setDatas(newDatas)
    }

    const searchInputHandler = (event) => {
        setText(event.target.value)
        setFilteredDatas(datas.filter(data => data.username.toLowerCase().startsWith(event.target.value.toLowerCase())))
    }

    return (
        <SearchContext.Provider value={{
            setSearchSourceData,
            filteredDatas,
            searchInputHandler,
        }}>
            {children}
        </SearchContext.Provider>
    )

}