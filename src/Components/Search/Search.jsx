import React, { useContext, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import { SearchContext } from '../../Contexts/SearchContext';


export default function Search() {

    const contextData = useContext(SearchContext)

    return (
        <div className="search-box">
            <input type="text" placeholder='جست و جو ...' onChange={(event) => contextData.searchInputHandler(event)} />
            <button><SearchIcon /></button>
        </div>
    )
}
