import React from 'react'
import { Sparkles } from "lucide-react";

const TopBar = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
            <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-pink-400 via-fuchsia-500 to-orange-400">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">
                    <span className="gradient-text">Data Analysis </span>
                    <span className="font-semibold text-foreground">Assistant</span>
                </span>
            </div>

            {/* View Selector */}
            <div className="flex items-center gap-1 p-1 rounded-full border border-input bg-muted">
                {["Auto", "Table", "Chart", "Summary"].map((option) => (
                    <button
                        key={option}
                        onClick={() => setViewMode(option)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer
          ${viewMode === option
                                ? "bg-white text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default TopBar
