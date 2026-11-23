import type { FunctionComponent } from "react";
import type React from "react"
import type { DefineStep } from "./defineStep.types";
import type { StepView } from "./StepComponent.types";

type Input = Record<string, unknown>;
type Output = Record<string, unknown>;

export type StepResult<TOutput> = {
  output: TOutput,
  Node: React.ReactNode
};

export type Step<TInput, TOutput> = (
  context?: TInput
) => Promise<StepResult<TOutput>>;

export type StepComponent = FunctionComponent;


export type defineStep = <
  TInput extends Input = Input,
  TOutput extends Output = Output
>(
  name: string,
  View: StepView<TInput, TOutput>
) => StepComponent


export interface ReactFlow {
  defineStep: DefineStep
}
