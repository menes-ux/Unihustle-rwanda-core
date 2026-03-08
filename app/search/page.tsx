"use client";

import { useState } from "react";

export default function SearchPage() {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    // Search function will go here
    console.log("Searching for:", searchText);
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
