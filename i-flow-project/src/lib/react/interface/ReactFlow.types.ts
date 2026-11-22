import type { FunctionComponent } from "react";
import type React from "react"
import type { DefineStep } from "./DefineStepComponent.types";

type Input = Record<string, unknown>;
type Output = Record<string, unknown>;

export type StepResult<TOutput> = {
  output: TOutput,
  Node: React.ReactNode
};

export type Step<TInput, TOutput> = (
  context?: TInput
) => Promise<StepResult<TOutput>>;

export type StepComponent<TInput, TOutput> = FunctionComponent<{
  context?: TInput,
  complete: (output: TOutput) => void
}>;


export type defineStep = <
    TInput extends Input = Input,
    TOutput extends Output = Output
  >(
    name: string,
    component: StepComponent<TInput, TOutput>
  ) => StepComponent<TInput, TOutput>;


export interface ReactFlow {
  defineStep: DefineStep
}
