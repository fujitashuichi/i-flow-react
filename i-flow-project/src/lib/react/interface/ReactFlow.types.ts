import type { FunctionComponent } from "react";
import type React from "react"

type Input = Record<string, unknown>;
type Output = Record<string, unknown>;

export type StepResult<TOutput> = {
  output: TOutput,
  component: React.ReactNode
};

export type Step<TInput, TOutput> = (
  context?: TInput
) => Promise<StepResult<TOutput>>;

export type StepComponent<TInput, TOutput> = FunctionComponent<{
  context?: TInput,
  next: (output: TOutput) => void
}>;


export interface ReactFlow {
  defineStep: <
    TInput extends Input = Input,
    TOutput extends Output = Output
  >(
    name: string,
    component: StepComponent<TInput, TOutput>
  ) => Step<TInput, TOutput>
}
