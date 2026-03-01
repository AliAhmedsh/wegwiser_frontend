import React from 'react';
import SearchIcon from '../icons/SearchIcon';

const SearchInput = ({ value = '', onChange = () => { }, placeholder = '' }) => {
    return (
        <div className="relative h-9 w-full mb-7">
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="text-sm h-full w-full border border-gray-400 rounded-md p-1 pr-10"
            />
            <div className="absolute top-[25%] right-4 text-gray-500 pointer-events-none">
                <SearchIcon width={18} />
            </div>
        </div>
    );
};


export default SearchInput;