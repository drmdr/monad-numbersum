"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Star, RotateCcw, Lightbulb, Check } from "lucide-react"

export default function NumberPuzzle() {
  // Game state
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(1250)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [mascotState, setMascotState] = useState<"happy" | "neutral" | "worried">("neutral")
  const [completedRows, setCompletedRows] = useState<boolean[]>(new Array(5).fill(false))
  const [completedCols, setCompletedCols] = useState<boolean[]>(new Array(5).fill(false))
  const [shakeCell, setShakeCell] = useState<{ row: number; col: number } | null>(null)

  // Initial puzzle state
  const [grid, setGrid] = useState([
    [3, 7, 2, 8, 5],
    [6, 1, 9, 4, 3],
    [2, 8, 5, 1, 7],
    [9, 3, 6, 2, 4],
    [4, 5, 1, 9, 8],
  ])

  const rowTargets = [25, 23, 23, 24, 27]
  const colTargets = [24, 24, 23, 24, 27]

  // Check if row/column sums are correct
  const checkSums = () => {
    const newCompletedRows = rowTargets.map((target, rowIndex) => {
      const sum = grid[rowIndex].reduce((acc, val) => acc + val, 0)
      return sum === target
    })

    const newCompletedCols = colTargets.map((target, colIndex) => {
      const sum = grid.reduce((acc, row) => acc + row[colIndex], 0)
      return sum === target
    })

    setCompletedRows(newCompletedRows)
    setCompletedCols(newCompletedCols)

    // Update mascot state
    const totalCompleted = newCompletedRows.filter(Boolean).length + newCompletedCols.filter(Boolean).length
    if (totalCompleted >= 7) {
      setMascotState("happy")
    } else if (totalCompleted >= 3) {
      setMascotState("neutral")
    } else {
      setMascotState("worried")
    }
  }

  useEffect(() => {
    checkSums()
  }, [grid])

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col })
  }

  const handleNumberInput = (num: number) => {
    if (selectedCell) {
      const newGrid = [...grid]
      newGrid[selectedCell.row][selectedCell.col] = num
      setGrid(newGrid)

      // Check if this creates an incorrect sum and shake if so
      setTimeout(() => {
        const rowSum = newGrid[selectedCell.row].reduce((acc, val) => acc + val, 0)
        const colSum = newGrid.reduce((acc, row) => acc + row[selectedCell.col], 0)
        const targetRow = rowTargets[selectedCell.row]
        const targetCol = colTargets[selectedCell.col]

        if (rowSum > targetRow || colSum > targetCol) {
          setShakeCell({ row: selectedCell.row, col: selectedCell.col })
          setTimeout(() => setShakeCell(null), 500)
        }
      }, 100)
    }
  }

  const resetGame = () => {
    setGrid([
      [3, 7, 2, 8, 5],
      [6, 1, 9, 4, 3],
      [2, 8, 5, 1, 7],
      [9, 3, 6, 2, 4],
      [4, 5, 1, 9, 8],
    ])
    setSelectedCell(null)
    setMascotState("neutral")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Monad Number Sums
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Level and Score */}
      <div className="relative z-10 flex justify-center gap-8 mb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Lv</span>
          </div>
          <span className="text-white font-bold text-xl">{level}</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-bold text-xl">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex justify-center items-center gap-8 px-4">
        {/* Mascot Character (Hidden) */}
        <div className="w-32 h-20"></div>

        {/* Game Grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
          <div className="grid grid-cols-6 gap-2">
            {/* Empty top-left corner */}
            <div></div>
            {/* Column targets */}
            {colTargets.map((target, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all duration-300 ${
                  completedCols[colIndex] ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-white/20"
                }`}
              >
                {target}
                {completedCols[colIndex] && <Check className="w-4 h-4 ml-1" />}
              </div>
            ))}

            {/* Grid rows */}
            {grid.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                {/* Row target */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all duration-300 ${
                    completedRows[rowIndex] ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-white/20"
                  }`}
                >
                  {rowTargets[rowIndex]}
                  {completedRows[rowIndex] && <Check className="w-4 h-4 ml-1" />}
                </div>

                {/* Grid cells */}
                {row.map((cell, colIndex) => (
                  <button
                    key={`cell-${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg transition-all duration-300 transform ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? "bg-purple-400 shadow-lg shadow-purple-400/50 scale-110"
                        : (completedRows[rowIndex] || completedCols[colIndex])
                          ? "bg-yellow-400/30 shadow-lg shadow-yellow-400/30"
                          : "bg-white/20 hover:bg-white/30"
                    } ${shakeCell?.row === rowIndex && shakeCell?.col === colIndex ? "animate-bounce bg-red-400" : ""}`}
                   
                  >
                    {cell}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Number Input Pad */}
      {selectedCell && (
        <div className="relative z-10 flex justify-center mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <Button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-lg border-0"
                 
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="relative z-10 flex justify-center gap-4 mt-6 pb-8">
        <Button
          onClick={resetGame}
          className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
         
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
        <Button
          className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
         
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          Hint
        </Button>
      </div>
    </div>
  )
}
