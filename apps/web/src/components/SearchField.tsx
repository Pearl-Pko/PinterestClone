import React from "react";
import SearchIcon from "@/public/search-icon.svg";

export default function SearchField() {
    return (
        <div className="bg-gray-200 rounded-full flex items-center py-3 px-4">
            <div className="flex flex-1 items-center gap-2">
                <SearchIcon fill="grey" />


                <input
                    className="bg-transparent appearance-none flex-1 focus:border-transparent hover:border-transparent focus:outline-none"
                    placeholder="Search your Pins"
                />
            </div>
        </div>
    );
}
