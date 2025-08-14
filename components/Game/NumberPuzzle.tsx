"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Lightbulb, Check, Heart, Wallet } from "lucide-react"
import { useFrame } from '@/components/farcaster-provider'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { parseEther, encodeFunctionData } from 'viem'
import { monadTestnet } from 'viem/chains'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from 'wagmi'

// 難易度設定 - 数学的に解が存在し、適度な難易度になるよう設計
const difficulties = {
  easy: {
    label: "Easy",
    rowTargets: [8, 11, 7, 9, 10],
    colTargets: [9, 8, 10, 7, 11],
    grid: [
      [3, 2, 4, 1, 2],
      [2, 3, 1, 4, 3],
      [1, 2, 3, 1, 2],
      [4, 1, 2, 1, 3],
      [2, 1, 3, 2, 4],
    ],
    // 解答例（true=選択, false=非選択）
    solution: [
      [true, true, false, true, true],
      [true, true, true, false, true],
      [true, false, true, true, false],
      [false, true, true, true, true],
      [true, true, false, false, true],
    ]
  },
  normal: {
    label: "Normal",
    rowTargets: [12, 15, 10, 14, 13],
    colTargets: [13, 11, 14, 12, 14],
    grid: [
      [4, 3, 5, 2, 3],
      [3, 2, 4, 5, 4],
      [2, 4, 1, 3, 2],
      [5, 1, 3, 2, 6],
      [3, 2, 4, 1, 5],
    ],
    solution: [
      [true, false, true, true, true],
      [true, true, true, false, true],
      [false, true, false, true, true],
      [true, true, true, true, false],
      [true, true, false, true, true],
    ]
  },
  hard: {
    label: "Hard",
    rowTargets: [18, 21, 16, 19, 20],
    colTargets: [19, 17, 20, 18, 20],
    grid: [
      [6, 4, 7, 3, 5],
      [5, 6, 3, 7, 4],
      [3, 5, 4, 2, 6],
      [7, 2, 6, 4, 3],
      [4, 3, 5, 6, 7],
    ],
    solution: [
      [true, false, true, true, true],
      [true, true, false, true, true],
      [true, true, true, false, false],
      [false, true, true, true, true],
      [true, true, true, false, true],
    ]
  }
}

export default function NumberPuzzle() {
  // Game state
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy')
  const [score, setScore] = useState(0)
  const [isWin, setIsWin] = useState(false)
  const [lives, setLives] = useState(3)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [correctFeedback, setCorrectFeedback] = useState<{ [key: string]: boolean }>({})
  const [solution, setSolution] = useState(difficulties.easy.solution)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStartTime, setGameStartTime] = useState<number | null>(null)
  const [isRecordingScore, setIsRecordingScore] = useState(false)
  const [showErrorEffect, setShowErrorEffect] = useState(false)
  const [lockedCells, setLockedCells] = useState<boolean[][]>(
    Array(5).fill(null).map(() => Array(5).fill(false))
  )

  // Wallet hooks
  const { isEthProviderAvailable, context } = useFrame()
  const { isConnected, address, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: hash, sendTransaction } = useSendTransaction()
  const { switchChain } = useSwitchChain()
  const { connect } = useConnect()

  // Puzzle data
  const [grid, setGrid] = useState(difficulties.easy.grid)
  const [rowTargets, setRowTargets] = useState(difficulties.easy.rowTargets)
  const [colTargets, setColTargets] = useState(difficulties.easy.colTargets)

  const [activeCells, setActiveCells] = useState<boolean[][]>(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(false))
  )

  // Derived state
  const [completedRows, setCompletedRows] = useState<boolean[]>(new Array(5).fill(false))
  const [completedCols, setCompletedCols] = useState<boolean[]>(new Array(5).fill(false))

  // エラー効果を表示
  const showError = () => {
    setShowErrorEffect(true)
    setTimeout(() => {
      setShowErrorEffect(false)
    }, 500)
  }

  // 難易度変更時の処理
  const changeDifficulty = (newDifficulty: 'easy' | 'normal' | 'hard') => {
    setDifficulty(newDifficulty)
    setGrid(difficulties[newDifficulty].grid)
    setRowTargets(difficulties[newDifficulty].rowTargets)
    setColTargets(difficulties[newDifficulty].colTargets)
    setSolution(difficulties[newDifficulty].solution)
    resetGame()
  }

  // Timer logic
  useEffect(() => {
    if (!gameStartTime || isWin) return

    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - gameStartTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStartTime, isWin])

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
      // 難易度に応じたスコア加算 + タイムボーナス
      const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'normal' ? 2 : 3
      const baseScore = 1000 * difficultyMultiplier
      const timeBonus = Math.max(0, 300 - timeElapsed) * 10 // 5分以内なら時間ボーナス
      setScore(prevScore => prevScore + baseScore + timeBonus)
    }
  }, [activeCells, grid, rowTargets, colTargets, difficulty])

  const handleCellClick = (row: number, col: number) => {
    if (isWin || lockedCells[row][col]) return // Don't allow changes after winning or if cell is locked

    // 初回クリック時にゲーム開始時間を記録
    if (!gameStartTime) {
      setGameStartTime(Date.now())
    }

    const newActiveCells = activeCells.map((r) => [...r])
    newActiveCells[row][col] = !newActiveCells[row][col]
    setActiveCells(newActiveCells)

    // 正解チェック - 解答と一致するかチェック
    const isCorrectMove = newActiveCells[row][col] === solution[row][col]
    if (isCorrectMove) {
      // セルをロック
      const newLockedCells = lockedCells.map((r) => [...r])
      newLockedCells[row][col] = true
      setLockedCells(newLockedCells)

      // 正解フィードバックを表示
      const key = `${row}-${col}`
      setCorrectFeedback(prev => ({ ...prev, [key]: true }))

      // 2秒後にフィードバックを消す
      setTimeout(() => {
        setCorrectFeedback(prev => {
          const newFeedback = { ...prev }
          delete newFeedback[key]
          return newFeedback
        })
      }, 2000)
    }

    // 試行回数を増やす
    setAttempts(attempts + 1)

    // 10回試行ごとにチェック
    if ((attempts + 1) % 10 === 0) {
      const rowsCompleted = completedRows.filter(Boolean).length
      const colsCompleted = completedCols.filter(Boolean).length

      // 進捗が少ない場合はライフを減らす
      if (rowsCompleted + colsCompleted < 3) {
        showError() // エラー効果を表示
        setLives(prev => {
          const newLives = prev - 1
          if (newLives <= 0) {
            // ゲームオーバー処理
            setTimeout(() => {
              alert('ゲームオーバー！ライフがなくなりました。')
              resetGame()
              setLives(3)
            }, 500)
          }
          return newLives
        })
      }
    }
  }

  const resetGame = () => {
    // 初期状態は全て非選択（false）にする
    setActiveCells(
      Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))
    )
    setLockedCells(
      Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))
    )
    setIsWin(false)
    setShowHint(false)
    setAttempts(0)
    setCorrectFeedback({})
    setTimeElapsed(0)
    setGameStartTime(null)
  }

  // スコア記録機能
  const recordScoreOnChain = async () => {
    if (!isConnected || chainId !== monadTestnet.id) {
      // ウォレット接続またはネットワーク切り替えが必要
      if (!isConnected) {
        connect({ connector: miniAppConnector() })
      } else {
        switchChain({ chainId: monadTestnet.id })
      }
      return
    }

    setIsRecordingScore(true)
    try {
      // スコアデータをトランザクションのdataフィールドに記録
      const scoreData = {
        player: context?.user?.username || 'Anonymous',
        fid: context?.user?.fid || 0,
        score: score,
        difficulty: difficulty,
        timeElapsed: timeElapsed,
        timestamp: Date.now()
      }

      // データをhexエンコード
      const dataHex = `0x${Buffer.from(JSON.stringify(scoreData)).toString('hex')}` as `0x${string}`

      // 小額のトランザクションでスコアを記録
      sendTransaction({
        to: address, // 自分自身に送信
        value: parseEther('0.001'), // 0.001 ETH
        data: dataHex
      })
    } catch (error) {
      console.error('Score recording failed:', error)
    } finally {
      setIsRecordingScore(false)
    }
  }

  const nextLevel = () => {
    // 難易度に応じて次のレベルへ
    if (difficulty === 'easy') {
      changeDifficulty('normal')
    } else if (difficulty === 'normal') {
      changeDifficulty('hard')
    } else {
      // Hardをクリアした場合は同じ難易度で別パターン
      resetGame()
    }
  }

  // ヒント表示
  const showHintHandler = () => {
    setShowHint(true)
    setTimeout(() => {
      setShowHint(false)
    }, 3000)
  }

  // ヒントロジック - 各行・列で1つだけ非アクティブにすべきセルを示す
  const getHint = () => {
    const hints: [number, number][] = []

    // 各行でチェック
    rowTargets.forEach((target, rowIndex) => {
      if (!completedRows[rowIndex]) {
        const sum = grid[rowIndex].reduce((acc, val, colIndex) => {
          return activeCells[rowIndex][colIndex] ? acc + val : acc
        }, 0)

        // 合計が目標より大きい場合、1つ非アクティブにすべきセルを見つける
        if (sum > target) {
          for (let colIndex = 0; colIndex < 5; colIndex++) {
            if (activeCells[rowIndex][colIndex] && sum - grid[rowIndex][colIndex] === target) {
              hints.push([rowIndex, colIndex])
              break
            }
          }
        }
      }
    })

    return hints.length > 0 ? hints[0] : null
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white flex flex-col p-4 transition-all duration-300 ${showErrorEffect ? 'animate-shake bg-red-900/30' : ''
      }`}>
      {/* 背景の正円 - 少なめで固定位置 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: 15, top: 20, size: 30 },
          { left: 80, top: 15, size: 25 },
          { left: 25, top: 70, size: 35 },
          { left: 70, top: 80, size: 20 },
          { left: 90, top: 50, size: 30 },
          { left: 10, top: 85, size: 25 },
          { left: 50, top: 10, size: 20 },
          { left: 5, top: 45, size: 35 }
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute bg-white/8 rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: `${pos.size}px`,
              height: `${pos.size}px`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="w-full max-w-md mx-auto flex justify-between items-center py-2 z-10">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-bold">Monad Number Sums</h1>
          <div className="text-sm text-gray-300">
            {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </div>
          {/* ウォレット接続状態 */}
          {isConnected && (
            <div className="text-xs text-green-400 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {chainId === monadTestnet.id ? 'Monad' : 'Wrong Network'}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {[...Array(lives)].map((_, i) => (
            <Heart key={i} className="w-5 h-5 text-red-500 fill-red-500" />
          ))}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{score}</div>
          <div className="text-sm text-gray-400">SCORE</div>
        </div>
      </header>

      {/* 難易度選択 */}
      <section className="w-full max-w-md mx-auto flex justify-around items-center py-2 z-10">
        <div className="flex items-center gap-2">
          {(['easy', 'normal', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => changeDifficulty(diff)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${difficulty === diff
                ? 'bg-yellow-400 text-purple-900'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              {difficulties[diff].label}
            </button>
          ))}
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
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300 ${completedCols[colIndex]
                  ? "bg-green-400 text-white shadow-lg shadow-green-400/50"
                  : "bg-yellow-400 text-purple-900"
                  }`}
              >
                {target}
              </div>
            ))}
            {grid.map((row, rowIndex) => (
              <React.Fragment key={`row-wrapper-${rowIndex}`}>
                <div
                  key={`row-target-${rowIndex}`}
                  className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300 ${completedRows[rowIndex]
                    ? "bg-green-400 text-white shadow-lg shadow-green-400/50"
                    : "bg-yellow-400 text-purple-900"
                    }`}
                >
                  {rowTargets[rowIndex]}
                </div>
                {row.map((cell, colIndex) => (
                  <button
                    key={`cell-${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={isWin}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-300 transform relative
                      ${activeCells[rowIndex][colIndex]
                        ? "bg-white/20 opacity-100"
                        : "bg-black/20 opacity-50"
                      } 
                      ${!isWin && "hover:bg-white/30 active:scale-95"}
                      ${showHint && getHint() && getHint()?.[0] === rowIndex && getHint()?.[1] === colIndex
                        ? "ring-4 ring-yellow-400 animate-pulse"
                        : ""
                      }
                    `}
                  >
                    {cell}
                    {activeCells[rowIndex][colIndex] && (
                      <span className="absolute w-full h-full rounded-full border-2 border-white/50"></span>
                    )}
                    {/* 正解フィードバック - 白い○ */}
                    {correctFeedback[`${rowIndex}-${colIndex}`] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-ping">
                          <Check className="w-5 h-5 text-purple-900" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* ゲーム説明 */}
      <div className="w-full max-w-md mx-auto text-center text-sm text-white/80 mb-4 z-10">
        <p>各行・列の数字の合計が目標値（黄色の数字）と一致するように、数字をクリックして選択してください。</p>
        <p className="mt-1 text-xs">選択した数字には白い丸が表示されます。目標達成した行・列は緑色になります。</p>
      </div>

      {/* Action Buttons */}
      <footer className="w-full max-w-md mx-auto flex justify-around items-center py-2 z-10">
        <Button
          onClick={resetGame}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          リセット
        </Button>
        <Button
          onClick={showHintHandler}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          ヒント
        </Button>
      </footer>

      {/* Win Modal */}
      {isWin && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 shadow-2xl transform scale-100 transition-transform duration-300 max-w-sm mx-4">
            <h2 className="text-4xl font-bold text-yellow-300 mb-4">おめでとう！</h2>
            <p className="text-lg mb-2">パズルをクリアしました！</p>
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-2xl font-bold text-yellow-300">{score}点</p>
              <p className="text-sm text-gray-300">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')} - {difficulty.toUpperCase()}
              </p>
            </div>

            <div className="space-y-3">
              {/* スコア記録ボタン */}
              {isEthProviderAvailable && (
                <button
                  onClick={recordScoreOnChain}
                  disabled={isRecordingScore}
                  className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  {isRecordingScore ? '記録中...' : 'スコアを記録'}
                </button>
              )}

              {/* トランザクション確認ボタン */}
              {hash && (
                <button
                  onClick={() => window.open(`https://testnet.monadexplorer.com/tx/${hash}`, '_blank')}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg"
                >
                  トランザクションを確認
                </button>
              )}

              <button
                onClick={nextLevel}
                className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-lg"
              >
                次のレベル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {lives <= 0 && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 shadow-2xl transform scale-100 transition-transform duration-300">
            <h2 className="text-4xl font-bold text-white mb-4">ゲームオーバー</h2>
            <p className="text-lg mb-6">ライフがなくなりました。</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  resetGame()
                  setLives(3)
                  setScore(0)
                }}
                className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-lg"
              >
                最初からやり直す
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
