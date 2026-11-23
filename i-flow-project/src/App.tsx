import { defineStep, Flow } from './lib/react'

const TrimNameStep = defineStep<{ name: string }, { name: string }> ({
  name: "trimName",
  View: ({ context, complete }) => {
    // contextを渡すのは未実装なので、ダミー
    context = { name: "太郎" };

    const output = { name: context?.name.trim() ?? '' }
    complete(output)
    return <p>名前: {output.name}</p>
  }
});

const GreetingStep = defineStep<{ name: string }, { greeting: string }>({
  name: "greeting",
  View: ({ context, complete }) => {
    // contextを渡すのは未実装なので、ダミー
    context = { name: "太郎" };
    
    const greeting = `こんにちは、${context?.name ?? 'ゲスト'}さん`
    complete({ greeting })
    return <p>{greeting}</p>
  }
});


function GreetingFlow() {
  return (
    <Flow initialContext={{ name: "太郎" }}>
      {TrimNameStep}
      {GreetingStep}
    </Flow>
  )
}


function App() {
  return (
    <>
      <TrimNameStep />
      <GreetingStep />
    </>
  )
}

export default App
