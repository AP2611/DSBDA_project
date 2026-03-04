import React from 'react'
import { Zap } from "lucide-react"
import { Upload } from "lucide-react"
import { useState, useRef } from "react";
import { FileIcon } from "lucide-react"

const Sidebar = ({ datasets, setDatasets, selectedDataset, setSelectedDataset }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith(".csv") || f.name.endsWith(".xlsx")
    );
    if (files.length) {
      const newDatasets = files.map(f => ({ name: f.name, size: f.size, file: f }));
      setDatasets(prev => [...prev, ...newDatasets]);
      setSelectedDataset(newDatasets[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      const newDatasets = files.map(f => ({ name: f.name, size: f.size, file: f }));
      setDatasets(prev => [...prev, ...newDatasets]);
      setSelectedDataset(newDatasets[0]);
    }
  };

  const fileInputRef = useRef(null);
  return (
    <div className="w-75 min-w-75 gradient-sidebar border-r border-[hsl(270,20%,90%)] flex flex-col py-5 px-4 gap-4">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2 pb-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-lg font-bold gradient-text">
          Datasets
        </span>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border-none cursor-pointer gradient-primary text-white font-semibold text-[15px] font-sans shadow-[0_4px_16px_hsla(280,80%,60%,0.35)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_6px_20px_hsla(280,80%,60%,0.45)] active:scale-95"
      >
        <Upload />
        Upload Dataset
      </button>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx" multiple className="hidden" onChange={handleFileInput} />

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl py-6 px-4 flex flex-col items-center gap-2.5 transition-all duration-200 cursor-pointer
    ${isDragOver
            ? "border-primary bg-primary/5"
            : "border-primary/40 bg-transparent"
          }`}
      >
        <FileIcon />
        <span className="text-[13px] text-muted-foreground font-medium text-center">
          Drop CSV or XLSX here 📁
        </span>
      </div>

      {datasets.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm pt-2">
          No datasets yet 🐣
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {datasets.map((ds, i) => (
            <div
              key={i}
              onClick={() => setSelectedDataset(ds)}
              className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-[13px] font-medium text-foreground transition-all duration-150 flex items-center gap-2
          ${selectedDataset?.name === ds.name
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-transparent border border-transparent hover:bg-muted"
                }`}
            >
              <span className="text-base">📊</span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{ds.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Sidebar
