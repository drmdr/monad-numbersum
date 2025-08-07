# Monad Number Sum コンポーネント一覧

このドキュメントは、Monad Number Sumアプリケーションで使用されている主要なコンポーネントの概要と使い方を説明します。

## 目次

1. [NumberPuzzle](#numberpuzzle) - メインゲームコンポーネント
2. [Button](#button) - UI用ボタンコンポーネント

## NumberPuzzle

`components/Game/NumberPuzzle.tsx`

### 概要

NumberPuzzleは、Monad Number Sumゲームのメインコンポーネントです。5x5のグリッドに数字を配置し、行と列の合計が目標値と一致するように数字をオン/オフする数字パズルゲームを実装しています。

### 機能

- **難易度設定**: Easy、Normal、Hardの3段階の難易度
- **ライフシステム**: プレイヤーは3つのライフを持ち、進捗が遅い場合にライフが減少
- **ヒント機能**: ヒントボタンを押すと、非アクティブにすべきセルを一時的に強調表示
- **スコアシステム**: 難易度に応じたスコア加算
- **ゲームオーバー**: ライフがなくなるとゲームオーバー
- **勝利条件**: すべての行と列の合計が目標値と一致したときにクリア

### 状態管理

```typescript
// 難易度設定
const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy')
// スコア
const [score, setScore] = useState(0)
// 勝利状態
const [isWin, setIsWin] = useState(false)
// ライフ
const [lives, setLives] = useState(3)
// ヒント表示
const [showHint, setShowHint] = useState(false)
// 試行回数
const [attempts, setAttempts] = useState(0)

// パズルデータ
const [grid, setGrid] = useState(difficulties.easy.grid)
const [rowTargets, setRowTargets] = useState(difficulties.easy.rowTargets)
const [colTargets, setColTargets] = useState(difficulties.easy.colTargets)

// アクティブセル（表示/非表示の状態）
const [activeCells, setActiveCells] = useState<boolean[][]>(
  Array(5).fill(null).map(() => Array(5).fill(true))
)

// 完了状態
const [completedRows, setCompletedRows] = useState<boolean[]>(new Array(5).fill(false))
const [completedCols, setCompletedCols] = useState<boolean[]>(new Array(5).fill(false))
```

### 主要な関数

- `changeDifficulty`: 難易度を変更する
- `handleCellClick`: セルをクリックしたときの処理
- `resetGame`: ゲームをリセットする
- `nextLevel`: 次のレベルに進む
- `showHintHandler`: ヒントを表示する
- `getHint`: ヒントとなるセルを計算する

### 使用例

```tsx
// ページコンポーネント内で使用する例
import NumberPuzzle from "@/components/Game/NumberPuzzle"

export default function GamePage() {
  return (
    <div>
      <NumberPuzzle />
    </div>
  )
}
```

## Button

`components/ui/button.tsx`

### 概要

Buttonは、アプリケーション全体で使用される汎用的なボタンコンポーネントです。shadcn/uiのボタンコンポーネントをベースにしています。

### 機能

- 様々なスタイルバリエーション（primary, secondary, destructive, outline, ghost, link）
- サイズバリエーション（default, sm, lg, icon）
- アイコン対応
- 無効状態の表現
- ローディング状態の表現

### 使用例

```tsx
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

// 基本的な使い方
<Button>ボタンテキスト</Button>

// バリアントの指定
<Button variant="destructive">削除</Button>

// サイズの指定
<Button size="sm">小さいボタン</Button>

// アイコン付きボタン
<Button>
  <RotateCcw className="w-5 h-5 mr-2" />
  リセット
</Button>

// 無効状態
<Button disabled>無効ボタン</Button>

// カスタムクラスの追加
<Button className="bg-pink-500 hover:bg-pink-600">カスタムスタイル</Button>
```

---

## 今後の拡張予定

1. **スコアボード機能**: ハイスコアを記録・表示する機能
2. **アニメーション強化**: セル選択時やクリア時のアニメーション追加
3. **テーマ切替**: ダークモード/ライトモードの切り替え機能
