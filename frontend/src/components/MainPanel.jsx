import React from 'react'
import { Sparkles } from "lucide-react"

const MainPanel = ({selectedDataset,viewMode}) => {
  return (
    // Chat Area
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 overflow-y-auto">
      {!selectedDataset ? (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-pink-400 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-[0_8px_32px_hsla(280,80%,60%,0.35)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-[22px] font-bold mb-2.5">
              <span className="gradient-text">Upload a dataset </span>
              <span style={{
                background: "linear-gradient(135deg, hsl(45, 95%, 55%), hsl(38, 90%, 55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>to get started</span>
            </div>
            <div className="text-[15px] text-muted-foreground">
              Drop a CSV in the sidebar and let's gooo 🚀
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-w-175 bg-card rounded-2xl px-6 py-5 border border-border shadow-[0_2px_16px_hsla(270,20%,50%,0.08)]">
          <div className="font-semibold text-[15px] mb-2 text-foreground">
            📊 {selectedDataset.name}
          </div>
          <div className="text-[13px] text-muted-foreground">
            Ready to analyze. Ask me anything about this dataset!
          </div>
        </div>
      )}
    </div>
  )
}

export default MainPanel
