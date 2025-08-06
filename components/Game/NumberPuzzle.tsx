"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Star, RotateCcw, Lightbulb, Check } from "lucide-react"

export default function NumberPuzzle() {
  // Game state
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(1250)
  const [isWin, setIsWin] = useState(false)

  // Puzzle data
  const [grid, setGrid] = useState([
    [5, 3, 4, 6, 7],
    [6, 7, 2, 1, 9],
    [1, 9, 8, 3, 4],
    [8, 5, 9, 7, 6],
    [4, 2, 6, 8, 5],
  ])
  // The solution requires deactivating certain cells. These targets are calculated based on a pre-defined solution.
  const rowTargets = [19, 25, 20, 22, 24]
  const colTargets = [20, 22, 24, 26, 20]

  const [activeCells, setActiveCells] = useState<boolean[][]>(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(true))
  )

  // Derived state
  const [completedRows, setCompletedRows] = useState<boolean[]>(new Array(5).fill(false))
  const [completedCols, setCompletedCols] = useState<boolean[]>(new Array(5).fill(false))

  // Game logic
  useEffect(() => {
    const newCompletedRows = rowTargets.map((target, rowIndex) => {
      const sum = grid[rowIndex].reduce((acc, val, colIndex) => {
        return activeCells[rowIndex][colIndex] ? acc + val : acc
      }, 0)
      return sum === target
    })

    const newCompletedCols = colTargets.map((target, colIndex) => {
      const sum = grid.reduce((acc, row, rowIndex) => {
        return activeCells[rowIndex][colIndex] ? acc + row[colIndex] : acc
      }, 0)
      return sum === target
    })

    setCompletedRows(newCompletedRows)
    setCompletedCols(newCompletedCols)

    const allCompleted = newCompletedRows.every(Boolean) && newCompletedCols.every(Boolean)
    if (allCompleted) {
      setIsWin(true)
    }
  }, [activeCells, grid, rowTargets, colTargets])

  const handleCellClick = (row: number, col: number) => {
    if (isWin) return // Don't allow changes after winning
    const newActiveCells = activeCells.map((r) => [...r])
    newActiveCells[row][col] = !newActiveCells[row][col]
    setActiveCells(newActiveCells)
  }

  const resetGame = () => {
    setActiveCells(
      Array(5)
        .fill(null)
        .map(() => Array(5).fill(true))
    )
    setIsWin(false)
  }

  const nextLevel = () => {
    // TODO: Implement next level logic
    resetGame()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white flex flex-col p-4 font-sans">
      {/* Starry background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="w-full max-w-md mx-auto flex justify-between items-center py-2 z-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Monad Number Sums</h1>
        <Button variant="ghost" size="icon" className="hover:bg-white/20">
          <Settings className="w-6 h-6" />
        </Button>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{score}</div>
          <div className="text-sm text-gray-400">SCORE</div>
        </div>
      </header>

      {/* Game Info */}
      <section className="w-full max-w-md mx-auto flex justify-around items-center py-2 z-10">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-yellow-400 font-bold">Lv</span>
          <span className="font-bold text-lg">{level}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <Star className="w-6 h-6 text-yellow-400" />
          <span className="font-bold text-lg">{score}</span>
        </div>
      </section>

      {/* Game Grid */}
      <main className="w-full max-w-md mx-auto z-10 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-2xl">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            <div />
            {colTargets.map((target, colIndex) => (
              <div
                key={`col-target-${colIndex}`}
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300 ${completedCols[colIndex] ? "bg-yellow-400 text-purple-900 shadow-lg shadow-yellow-400/50" : "bg-white/20"}`}
              >
                {target}
              </div>
            ))}
            {grid.map((row, rowIndex) => (
              <React.Fragment key={`row-wrapper-${rowIndex}`}>
                <div
                  key={`row-target-${rowIndex}`}
                  className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300 ${completedRows[rowIndex] ? "bg-yellow-400 text-purple-900 shadow-lg shadow-yellow-400/50" : "bg-white/20"}`}
                >
                  {rowTargets[rowIndex]}
                </div>
                {row.map((cell, colIndex) => (
                  <button
                    key={`cell-${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={isWin}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-300 transform ${activeCells[rowIndex][colIndex] ? "bg-white/20 opacity-100" : "bg-black/20 opacity-50"} ${!isWin && "hover:bg-white/30 active:scale-95"}`}
                  >
                    {cell}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* Action Buttons */}
      <footer className="w-full max-w-md mx-auto flex justify-around items-center py-2 z-10">
        <Button
          onClick={resetGame}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200">
          <Lightbulb className="w-5 h-5 mr-2" />
          Hint
        </Button>
      </footer>

      {/* Win Modal */}
      {isWin && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 shadow-2xl transform scale-100 transition-transform duration-300">
            <h2 className="text-4xl font-bold text-yellow-300 mb-4">Congratulations!</h2>
            <p className="text-lg mb-6">You cleared the puzzle!</p>
            <div className="mt-6">
              <button
                onClick={nextLevel}
                className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-lg"
              >
                Next Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
