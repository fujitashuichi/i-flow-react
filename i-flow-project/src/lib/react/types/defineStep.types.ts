import type { FunctionComponent } from "react";
import type { StepPayload } from "./common.types";
import type { StepView } from "./StepView.types";

export type StepComponent = FunctionComponent;

export type DefineStepProps<
  TContext extends StepPayload,
  TOutput extends StepPayload
> = {
  name: string;
  View: StepView<TContext, TOutput>;
}

export type DefineStep = <
  TContext extends StepPayload,
  TOutput extends StepPayload
>(
  props: DefineStepProps<TContext, TOutput>
) => StepComponent;
