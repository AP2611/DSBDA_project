import React from 'react'
import Sidebar from "../components/Sidebar"
import TopBar from '../components/TopBar';
import MainPanel from '../components/MainPanel';
import { useState } from "react";

const Index = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [viewMode, setViewMode] = useState("Auto");

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        datasets={datasets}
        setDatasets={setDatasets}
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar viewMode={viewMode} setViewMode={setViewMode} />
        <MainPanel
          selectedDataset={selectedDataset}
          viewMode={viewMode}
        />
      </div>
    </div>
  )
}

export default Index
