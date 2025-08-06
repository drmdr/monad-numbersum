'use client'

import { useState, useEffect } from 'react'
import { useFrame } from '@/components/farcaster-provider'

export function NumberSumGame() {
  const { context } = useFrame()
  const [targetNumber, setTargetNumber] = useState<number>(0)
  const [currentSum, setCurrentSum] = useState<number>(0)
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([])
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [score, setScore] = useState<number>(0)
  const [level, setLevel] = useState<number>(1)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [timeLeft, setTimeLeft] = useState<number>(30)

  // ゲームの初期化
  const initializeGame = () => {
    const newLevel = level
    const newTarget = Math.floor(Math.random() * (10 * newLevel)) + 10 * newLevel
    setTargetNumber(newTarget)
    
    // 利用可能な数字を生成
    const numbersCount = 5 + Math.floor(newLevel / 2)
    const newAvailableNumbers = []
    
    for (let i = 0; i < numbersCount; i++) {
      const num = Math.floor(Math.random() * (newTarget / 2)) + 1
      newAvailableNumbers.push(num)
    }
    
    setAvailableNumbers(newAvailableNumbers)
    setSelectedNumbers([])
    setCurrentSum(0)
    setGameStatus('playing')
    setTimeLeft(30 + (newLevel * 5))
  }

  // タイマー処理
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameStatus('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus])

  // ゲーム開始時の初期化
  useEffect(() => {
    initializeGame()
  }, [level])

  // 数字を選択
  const selectNumber = (number: number, index: number) => {
    if (gameStatus !== 'playing') return
    
    const newSum = currentSum + number
    const newSelected = [...selectedNumbers, number]
    
    // 選択した数字を利用可能リストから削除
    const newAvailable = [...availableNumbers]
    newAvailable.splice(index, 1)
    
    setCurrentSum(newSum)
    setSelectedNumbers(newSelected)
    setAvailableNumbers(newAvailable)
    
    // 目標達成チェック
    if (newSum === targetNumber) {
      setGameStatus('won')
      setScore(score + level * 100)
      setTimeout(() => {
        setLevel(level + 1)
      }, 1500)
    } else if (newSum > targetNumber) {
      setGameStatus('lost')
    }
  }

  // リセットボタン
  const resetGame = () => {
    if (gameStatus === 'lost') {
      setLevel(1)
      setScore(0)
    }
    initializeGame()
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6 p-4">
      <h1 className="text-3xl font-bold text-center">Number Sum Game</h1>
      
      <div className="w-full bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm">レベル: <span className="font-bold">{level}</span></p>
            <p className="text-sm">スコア: <span className="font-bold">{score}</span></p>
          </div>
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full">
            {timeLeft}秒
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-lg">目標の数: <span className="text-2xl font-bold text-blue-600">{targetNumber}</span></p>
          <p className="text-lg">現在の合計: <span className={`text-2xl font-bold ${currentSum > targetNumber ? 'text-red-600' : 'text-green-600'}`}>{currentSum}</span></p>
        </div>
        
        {gameStatus === 'playing' && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {availableNumbers.map((num, index) => (
              <button
                key={index}
                onClick={() => selectNumber(num, index)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-lg font-bold"
              >
                {num}
              </button>
            ))}
          </div>
        )}
        
        {gameStatus !== 'playing' && (
          <div className="text-center mb-4">
            <p className={`text-xl font-bold ${gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
              {gameStatus === 'won' ? '成功！次のレベルへ' : 'ゲームオーバー'}
            </p>
            <button
              onClick={resetGame}
              className={`mt-2 py-2 px-4 rounded-lg text-white font-bold ${gameStatus === 'won' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {gameStatus === 'won' ? '次のレベル' : 'リスタート'}
            </button>
          </div>
        )}
        
        {selectedNumbers.length > 0 && (
          <div className="mt-4">
            <p className="text-sm mb-1">選択した数字:</p>
            <div className="flex flex-wrap gap-1">
              {selectedNumbers.map((num, index) => (
                <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm">
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p>数字を選んで目標の合計に到達しよう！</p>
      </div>
    </div>
  )
}
