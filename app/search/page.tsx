"use client";

import { useState } from "react";

export default function SearchPage() {
  const [searchText, setSearchText] = useState("");

  const handleSearch = async () => {
    console.log("Searching for:", searchText);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
      const data = await response.json();
      console.log("Response from API:", data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Student Search</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search for students (e.g., video editing)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
