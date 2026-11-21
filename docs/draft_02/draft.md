# IFlow React 設計方針（Issue #3/#4）

> この資料は、Issue #3/#4で検討している現時点の設計方針をまとめたものです。
> 既存の [IFlowReact_draft.md](./IFlowReact_draft.md) は変更せず、初期案として残します。

## 1. 背景

現在の`defineStep`は、Stepを実行する関数を返します。実行するとPromiseが始まり、`next(output)`が呼ばれるまで待機した後、`output`と`ReactNode`を返します。

この形では、Stepの定義・実行・画面生成の責務がまとまり、実行タイミングが分散します。画面を表示する前に出力を待つ構造にもなり、Reactのレンダリングサイクルと合いません。

まず利用側の書き方を定め、それを支える実装を考えます。Queueなどのオブジェクトによる集中管理は実装候補ですが、利用者に特定の構造を強制することとは分けて検討します。

## 2. 目的と範囲

このライブラリが扱う中心は、業務フロー内で共有するContextと、各Stepが作成するペイロードです。

- 画面の配置・表示・遷移は、利用側のReactツリーやRouterに任せます。
- `Flow`はContextのスコープ、共有状態、更新通知を扱います。
- `Step`は通常のReactコンポーネントとして配置でき、FlowのContextを利用してペイロードを渡します。
- FlowはStepの順序から次の画面を選んだり、各Stepを強制的にレンダリングしたりしません。

したがって、StepをFlow直下に集めることや、Flowが子要素を列挙して遷移順を作ることは必須にしません。たとえば、次のようなReactツリーへの配置を目指します。

```tsx
<ComponentA>
  <StepComponent />
</ComponentA>
```

## 3. APIの責務

### `Flow`

`Flow`は共有Contextのスコープを提供します。利用側の画面構成やRouterを包む場合でも、子孫のStepを走査して順序を決める役割は持ちません。

### `DefineStep` / `defineStep`

現在の実行関数を返す形は見直します。Stepを定義した時点で実行を始めず、実行結果として`ReactNode`を返すのではなく、Reactがレンダリングできるコンポーネントを扱う形を検討します。

Issue #4では、コンポーネントを持つオブジェクトを返す案に加え、次のようなJSX形式も提案されています。

```tsx
<DefineStep
  name="name"
  component={NamePage}
/>
```

この形式では、`DefineStep`が`component`を通常のReactコンポーネントとしてその場所にレンダリングします。`defineStep`がコンポーネントを持つオブジェクトを返す形式と、`<DefineStep />`として直接使う形式のどちらにするかは未決です。

### Stepコンポーネント

StepコンポーネントはReactにレンダリングさせます。関数を通常の関数として直接呼び出さず、HooksやローカルstateをReactのライフサイクル内で扱えるようにします。

ContextとOutputの型を表す候補は次のとおりです。

```tsx
type StepProps<TContext, TOutput> = {
  context: TContext;
  complete: (output: TOutput) => void;
};
```

OutputはReactコンポーネントの戻り値ではなく、完了時にFlowへ渡すペイロードです。`complete(output)`はペイロードの作成・受け渡しを表し、画面遷移は行いません。`next(output)`は次画面への遷移を連想させるため、命名候補から外します。

## 4. 型と利用側の記述案

ContextとOutputの型は、JSXの型引数または`component`のpropsから推論する方法を検討します。たとえば、型引数を使う場合は次のように書けます。

```tsx
<DefineStep<{ name: string }, { greeting: string }>
  name="greeting"
  component={GreetingPage}
/>
```

型だけを渡す目的で`contextType={...}`や`outputType={...}`のような実行時propsを設けることは、スキーマ値も必要とする場合を除いて避けます。

コンポーネントのprops契約には、ContextとOutputを受け取る`complete`を含める案があります。

```tsx
type GreetingPageProps = {
  context: { name: string };
  complete: (output: { greeting: string }) => void;
};

function GreetingPage({ context, complete }: GreetingPageProps) {
  return (
    <button
      onClick={() => complete({ greeting: `こんにちは、${context.name}さん` })}
    >
      完了
    </button>
  );
}
```

この契約なら、`component`として渡す画面のpropsと、Stepが扱うContext・Outputの型を照合できます。ただし、Contextを`context` propで渡すか、Contextの各フィールドをpropsへ展開するか、また`complete`の宣言をどこまで型で必須にするかは未決です。TypeScriptの構造的型付けにも留意が必要です。また、型で実行時に`complete`が必ず呼ばれることまでは保証できません。

## 5. 画面遷移との関係

利用側のRouterや状態管理が、どの画面を表示するかを決めます。Stepは画面上の操作に応じて`complete(output)`を呼び、Flowはペイロードを共有状態へ反映・通知します。

```text
利用側のReactツリー / Router
    └── 表示する画面を決定
          └── Stepコンポーネント
                ├── FlowのContextを利用
                └── complete(output)でペイロードを渡す
                      └── Flowが共有状態を更新・通知
```

`<Flow><Step /><Step /></Flow>`のように全StepをFlow直下に置く案は、Queueの形を表現しやすい一方、Stepごとのレンダリング管理が必要になり、利用側の画面設計と衝突する可能性があります。そのため、現時点では構造として強制しません。

## 6. 実装候補と未決事項

- Context更新と通知を集中管理するために、Queueなどのオブジェクトを内部実装に使う案があります。Queueを公開APIとして利用者に強制することは決まっていません。
- `complete(output)`の出力を共有Contextへマージするか、置き換えるか、Stepごとに保存するかは未決です。
- Context更新時の購読・再レンダリングはReactの通常の仕組みを基本にし、Step単位の強制レンダリングを避ける方針です。
- `defineStep`がコンポーネントを持つオブジェクトを返す形式と、`<DefineStep component={...} />`形式の選択は未決です。
- Contextをpropsで渡す方法、Outputの型をpropsから推論する方法、`complete`の型契約の厳密さは引き続き検討します。
- Flowの初期化、Context更新の適用規則、Flowのスコープや破棄時の扱いは未決です。

## 参照Issue

- [#3 defineConfigの責務が肥大化している](https://github.com/fujitashuichi/i-flow-react/issues/3)
- [#4 利用側に書かせたいコードを決める](https://github.com/fujitashuichi/i-flow-react/issues/4)
- [#5 全体設計の思案](https://github.com/fujitashuichi/i-flow-react/issues/5)
