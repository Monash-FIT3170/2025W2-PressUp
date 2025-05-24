import React, {useState} from "react";

export const SearchBar = ({
    onSearch,
    initialSearchTerm = " "
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        onSearch(newSearchTerm);
    };

    return (
        <div id="search-bar" className="mb-4 px-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-pink-400">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="w-5 h-5 text-gray-400 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" 
                    d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full text-sm placeholder-gray-400 focus:outline-none"
                    />
            </div>
        </div>
    )
}