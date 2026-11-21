import type { ReactNode } from "react";
import type { StepPayload } from "./common.types";
import type { StepViewComponent } from "./StepViewComponent.types";

export type DefineStepProps<
  TContext extends StepPayload,
  TOutput extends StepPayload
> = {
  name: string;
  component: StepViewComponent<TContext, TOutput>;
}

export type DefineStepComponent = <
  TContext extends StepPayload,
  TOutput extends StepPayload
>(
  props: DefineStepProps<TContext, TOutput>
) => ReactNode;
