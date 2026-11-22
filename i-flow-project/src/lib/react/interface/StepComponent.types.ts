import type { FunctionComponent } from "react";
import type { StepPayload } from "./common.types";

export type Complete<TOutput extends StepPayload> = (
  output: TOutput
) => void;

export type StepViewProps<
  TContext extends StepPayload = StepPayload,
  TOutput extends StepPayload = StepPayload
> = {
  context: TContext;
  complete: Complete<TOutput>;
};

export type StepView<
  TContext extends StepPayload = StepPayload,
  TOutput extends StepPayload = StepPayload
> = FunctionComponent<StepViewProps<TContext, TOutput>>;
