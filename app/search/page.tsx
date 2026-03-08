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
    <div>
      <h1>Student Search</h1>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Enter search term"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
