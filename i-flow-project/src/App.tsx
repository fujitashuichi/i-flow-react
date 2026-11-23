import React, { useState } from 'react';
import { defineStep, Flow } from './lib/react'

const TrimNameStep = defineStep<{}, { name: string }> ({
  name: "trimName",
  View: ({ complete }) => {
    const [done, setDone] = useState<boolean>(false);

    const onCompleteHandler = (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const name = formData.get("name");
      console.debug(name);
      if (typeof name !== "string") {
        return alert("不正な値です。");
      }

      setDone(true);
      complete({ name: name.trim() });
    }

    return (
      <>
        <form id='name-form' onSubmit={onCompleteHandler}>
          <input
            name='name'
            placeholder='田中 太郎'
            required
          />
    
          <button type='submit'>実行</button>
        </form>

        <p>{done ? "完了" : "名前を入力"}</p>
      </>
    )
  }
});


function GreetingFlow() {
  return (
    <Flow initialContext={{ name: "太郎" }}>
      {TrimNameStep}
    </Flow>
  )
}


function App() {
  return (
    <TrimNameStep />
  )
}

export default App
