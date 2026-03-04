import React from 'react'

const InputBar = () => {
    return (
        <div className="px-6 py-4 border-t border-border bg-background">
            <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full border border-input transition-all duration-200
    ${selectedDataset
                    ? "bg-white shadow-[0_2px_12px_hsla(270,20%,50%,0.1)]"
                    : "bg-muted shadow-none"
                }`}
            >
                <input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    disabled={!selectedDataset}
                    placeholder={selectedDataset ? "Ask about your data..." : "Upload and select a dataset to begin. ✨"}
                    className={`flex-1 border-none outline-none bg-transparent text-[15px] font-sans
        ${selectedDataset ? "text-foreground" : "text-muted-foreground"}`}
                />
                {selectedDataset && (
                    <button
                        className={`w-9 h-9 rounded-full border-none flex items-center justify-center shrink-0 transition-all duration-200
          ${inputValue
                                ? "gradient-primary cursor-pointer"
                                : "bg-input cursor-default"
                            }`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

export default InputBar
