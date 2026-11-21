import { defineStep } from './lib/react'

const nameStep = defineStep<{ name: string }, { name: string }>(
  'name',
  ({ context, next }) => {
    const output = { name: context?.name.trim() ?? '' }
    next(output)
    return <p>名前: {output.name}</p>
  },
)

const greetingStep = defineStep<{ name: string }, { greeting: string }>(
  'greeting',
  ({ context, next }) => {
    const greeting = `こんにちは、${context?.name ?? 'ゲスト'}さん`
    next({ greeting })
    return <p>{greeting}</p>
  },
)

function App() {
  return (
    <main>
    </main>
  )
}

export default App
