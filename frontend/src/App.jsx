import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Index from "./pages/Index";
import DataAnalysisAssistant from "./pages/DataAnalysisAssistant"
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Index></Index>
    {/* <DataAnalysisAssistant></DataAnalysisAssistant> */}
    </>
  )
}

export default App
