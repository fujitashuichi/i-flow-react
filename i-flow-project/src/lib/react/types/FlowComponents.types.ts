import type { ReactNode } from "react";
import type { StepPayload } from "./common.types";

export type FlowProps<TContext extends StepPayload> = {
  initialContext: TContext;
  children?: ReactNode;
}

export type FlowComponent = <TContext extends StepPayload>(
  props: FlowProps<TContext>
) => ReactNode;
