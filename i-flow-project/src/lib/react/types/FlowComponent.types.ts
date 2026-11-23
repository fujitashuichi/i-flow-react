import type { ReactNode } from "react";
import type { StepPayload } from "./common.types";
import type { StepComponent } from "./defineStep.types";

export type FlowProps<TContext extends StepPayload> = {
  initialContext: TContext;
  children?: StepComponent | StepComponent[];
}

export type FlowComponent = <TContext extends StepPayload>(
  props: FlowProps<TContext>
) => ReactNode;
