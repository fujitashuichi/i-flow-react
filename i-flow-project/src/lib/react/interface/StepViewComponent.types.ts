import type { ComponentType } from "react";
import type { StepPayload } from "./common.types";

export type Complete<TOutput extends StepPayload> = (
  output: TOutput
) => void;

export type StepViewProps<
  TContext extends StepPayload,
  TOutput extends StepPayload
> = {
  context: TContext;
  complete: Complete<TOutput>;
}

export type StepViewComponent<
  TContext extends StepPayload,
  TOutput extends StepPayload
> = ComponentType<StepViewProps<TContext, TOutput>>;
