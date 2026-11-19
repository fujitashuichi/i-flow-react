# IFlow Architecture たたき台

## 1. コンセプトとコア理論

### 基本思想: $g(f(x))$

Reactの基本哲学である $UI = f(x)$を基にする。

1画面の結果を次の画面遷移に利用する。これによって、UIフローを宣言的に定義する。

- $f(x)$: 1画面（Step）はローカルな状態とUIを完結させ、完了時に次のステップへ渡す「出力値」を返す。
- `IFlow { f; g; h; ... }`: 複数の画面の並び順そのものを「時間軸（タイムライン）」として定義し、Contextの寿命と遷移を1つのスコープに閉じ込める。DIしたり手続きを書くのを自由にする。

### 解決する課題

1. Context: 複数の画面でいろいろなContextが必要になると、どこか一か所で流れを見ずらい。これを解決したい。
2. 時間軸の制御: 履歴をイミュータブルなスタックとして保持し、「戻る・進む」を単なるURL変更ではなく「時間軸の巻き戻し・状態復元」として扱う、という利点が生まれればなお良い。

---

## 2. ライブラリ化の全体手順

### ディレクトリ構成

まずは、1つのViteプロジェクト内に「ライブラリ本体」と「検証用アプリ」を同居させる。
以下の構成から発展させる。

```text
iflow-project/
├── src/
│   ├── lib/                 # ライブラリ本体
│   │   ├── core.ts          # エンジン
│   │   ├── react.tsx        # Reactバインディング（Hooks / コンポーネント）
│   │   └── index.ts
│   └── playground/          # 理論検証・動作確認用のミニアプリ
│       ├── steps/           # 各画面 f(x), g(x), h(x) の実装
│       └── App.tsx          # IFlow の組み立てと実行
├── package.json
└── tsconfig.json
```

### APIデザインの確定

`playground/App.tsx` に想定の構文を記述しながら設計する。

### Core層とReact層の分離実装

- Core層 (`core.ts`): 原則React機能を一切使わない。
- React層 (`react.tsx`): `useSyncExternalStore` を用いてCore層の状態変化をReactのレンダリングサイクルに同期させます。

### パッケージ切り出し

コアロジックが安定したら、`tsup` または `Vite Library Mode` を導入し、ESM/CJSビルドと型定義ファイル（`.d.ts`）を生成できるようにする。

---

## 3. コア機能の設計

### データ構造

理想は、`IFlow` 内の結果をランタイムに配列として保持する。

```typescript
export interface TimelineEntry<TInput = any, TOutput = any> {
  stepId: string;
  input: TInput;          // この画面に入る際に受け取ったContext
  output?: TOutput;       // この画面が完了した際に次の画面へ渡す値
  timestamp: number;
}

// Flow全体の内部状態
export interface FlowState {
  timeline: TimelineEntry[]; // 時間軸の履歴スタック
  currentIndex: number;      // 現在時刻 t のポインタ
  status: 'running' | 'completed';
}
```

> #### 草案
>
> - 進む: `next(output)`
> `currentIndex` のエントリに `output` を記録。これを次のステップの `input` とする。新しいエントリを `timeline` にプッシュして `currentIndex` を進める。
>
> - 戻る: `back()`
> `currentIndex` を `-1` する。過去の `input` がそのまま保持されているため、前の画面の状態が完全に復元される。

### 3つの基本API（草案）

ライブラリが提供する機能は、初期段階では以下の3つだけに絞る。

#### `defineStep`（画面の定義）

前のステップからの `context` と、次のステップへ進むための `complete(output)` 関数を受け取るコンポーネントを定義する。

#### `createFlow`（フローの定義）

ステップの相互関係を自由に定義する。

#### `<FlowRenderer />`（実行ランタイム）

`currentIndex` に対応するステップコンポーネントを動的にマウントし、`key={currentIndex}` を付与することでステップ間のローカルStateの混線を防ぐ。

---

## 簡易な例（AIによる実装）

### `src/lib/core.ts`

<details>
<summary>コア機能</summary>

```typescript
export type StepComponent<TIn, TOut> = (props: {
  context: TIn;
  next: (output: TOut) => void;
  back: () => void;
  canGoBack: boolean;
}) => any;

export interface StepDefinition<TIn = any, TOut = any> {
  id: string;
  component: StepComponent<TIn, TOut>;
}

export class FlowStore<TInitial> {
  private steps: StepDefinition[] = [];
  private timeline: { stepIndex: number; context: any }[] = [];
  private currentIndex = 0;
  private listeners = new Set<() => void>();

  constructor(steps: StepDefinition[], initialContext: TInitial) {
    this.steps = steps;
    this.timeline = [{ stepIndex: 0, context: initialContext }];
  }

  getSnapshot = () => {
    const currentEntry = this.timeline[this.currentIndex];
    return {
      currentEntry,
      currentStep: this.steps[currentEntry.stepIndex],
      canGoBack: this.currentIndex > 0,
      isCompleted: this.currentIndex >= this.steps.length,
    };
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  next = (output: any) => {
    const nextStepIndex = this.timeline[this.currentIndex].stepIndex + 1;
    // 未来の履歴があれば切り捨てて新しい時間軸を作る
    const nextTimeline = this.timeline.slice(0, this.currentIndex + 1);
    nextTimeline.push({ stepIndex: nextStepIndex, context: output });

    this.timeline = nextTimeline;
    this.currentIndex += 1;
    this.emit();
  };

  back = () => {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.emit();
    }
  };
}
```
</details>

### `src/lib/react.tsx`

<details>
<summary>Reactバインディング</summary>

```tsx
import React, { useSyncExternalStore } from 'react';
import { FlowStore, StepComponent, StepDefinition } from './core';

export function defineStep<TIn, TOut>(
  id: string,
  component: StepComponent<TIn, TOut>
): StepDefinition<TIn, TOut> {
  return { id, component };
}

// 型安全なビルダー（f -> g -> h の型連鎖）
export class FlowBuilder<TInitial, TCurrent> {
  constructor(private steps: StepDefinition[] = []) {}

  static start<TIn, TOut>(step: StepDefinition<TIn, TOut>) {
    return new FlowBuilder<TIn, TOut>([step]);
  }

  then<TNextOut>(step: StepDefinition<TCurrent, TNextOut>) {
    return new FlowBuilder<TInitial, TNextOut>([...this.steps, step]);
  }

  build() {
    const steps = this.steps;
    return function FlowRunner({
      initialContext,
      onComplete,
    }: {
      initialContext: TInitial;
      onComplete?: (finalOutput: TCurrent) => void;
    }) {
      const [store] = React.useState(() => new FlowStore(steps, initialContext));
      const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

      React.useEffect(() => {
        if (state.isCompleted && onComplete) {
          onComplete(state.currentEntry.context);
        }
      }, [state.isCompleted, state.currentEntry.context, onComplete]);

      if (state.isCompleted || !state.currentStep) {
        return null;
      }

      const StepView = state.currentStep.component;
      return (
        <StepView
          key={`${state.currentStep.id}-${state.currentEntry}`}
          context={state.currentEntry.context}
          next={store.next}
          back={store.back}
          canGoBack={state.canGoBack}
        />
      );
    };
  }
}
```
</details>

### `src/playground/App.tsx`

<details>
<summary>使用側</summary>

```tsx
import React from 'react';
import { defineStep, FlowBuilder } from '../lib/react';

// f(x): 名前入力画面
const NameStep = defineStep<{ defaultName: string }, { name: string }>(
  'name',
  ({ context, next }) => {
    const [name, setName] = React.useState(context.defaultName);
    return (
      <div>
        <h2>Step 1: 名前入力</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => next({ name })}>次へ</button>
      </div>
    );
  }
);

// g(f(x)): 確認画面（前の画面の出力 { name } が自動的に context になる）
const ConfirmStep = defineStep<{ name: string }, { confirmed: boolean }>(
  'confirm',
  ({ context, next, back }) => (
    <div>
      <h2>Step 2: 確認</h2>
      <p>入力された名前: {context.name}</p>
      <button onClick={back}>戻る</button>
      <button onClick={() => next({ confirmed: true })}>確定</button>
    </div>
  )
);

// IFlow { f, g } の定義
const OnboardingFlow = FlowBuilder.start(NameStep)
  .then(ConfirmStep)
  .build();

export function App() {
  return (
    <OnboardingFlow
      initialContext={{ defaultName: 'ゲスト' }}
      onComplete={(res) => alert('完了: ' + JSON.stringify(res))}
    />
  );
}
```
</details>

---

## 5. 今後の拡張テーマ

### 条件分岐の型安全な表現

`then` だけでなく、出力値に応じて次のステップを動的に振り分ける `branch((output) => output.isAdmin ? AdminStep : UserStep)` の導入。

### サブフローのネスト

1つの `Flow` 自体を `StepDefinition` として扱い、大きなフローの中に小さなフローを入れ子にできるフラクタル構造の実現。

### ブラウザ履歴（History API / URL）との双方向同期

`FlowStore` の `currentIndex` とブラウザの `window.history` を同期させ、ブラウザの「戻る・進む」ボタンで時間軸を移動できるようにする。
