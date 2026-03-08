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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F4" }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-12 h-17 flex items-center justify-between bg-white/96 backdrop-blur-md shadow-sm">
        <a href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-black no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F97316" }}>
            <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          UniHustle
        </a>
        <div className="flex items-center gap-2.5">
          <a href="#" className="text-sm font-semibold px-5 py-2 border-2 rounded-full transition-colors no-underline" style={{ color: "#44403C", borderColor: "#D6D3D1" }}>
            Log In
          </a>
          <a href="#" className="text-sm font-bold text-white px-5.5 py-2 rounded-full transition-all no-underline hover:-translate-y-0.5" style={{ background: "#F97316" }}>
            Sign Up
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 px-12 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-xs font-bold tracking-wider uppercase" style={{ background: "#FFEDD5", color: "#EA580C" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F97316" }}></span>
              Find Talent
            </div>
            <h1 className="text-5xl font-bold mb-5 tracking-tight" style={{ fontFamily: "Georgia, serif", color: "#0C0A09", letterSpacing: "-0.02em" }}>
              Search <span className="italic" style={{ color: "#F97316" }}>Student Talent</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#78716C", lineHeight: "1.7" }}>
              Find verified university students with the skills you need
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center gap-2.5 bg-white border-2 rounded-full px-5 py-3.5 transition-all hover:border-gray-400" style={{ borderColor: "#D6D3D1" }}>
              <span className="text-xl">🔍</span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search hustles, skills, or categories..."
                className="flex-1 border-none outline-none text-base bg-transparent"
                style={{ color: "#0C0A09" }}
              />
              <button 
                onClick={handleSearch}
                className="px-7 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                style={{ 
                  background: "#F97316",
                  boxShadow: "0 4px 16px rgba(249, 115, 22, 0.3)"
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Results Section Placeholder */}
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎓</div>
            <p className="text-base font-medium" style={{ color: "#78716C" }}>
              Enter a skill or keyword to find students
            </p>
            <p className="text-sm mt-2" style={{ color: "#A8A29E" }}>
              Try: "video editing", "web development", "graphic design"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
