import type { ReactFlow, Step, StepComponent, StepResult } from "./interface/ReactFlow.types";
import { runStep } from "./runStep";

export const defineStep: ReactFlow["defineStep"] = <TInput, TOutput>(
  name: string,
  component: StepComponent<TInput, TOutput>
): Step<TInput, TOutput> => {
  return (context?): Promise<StepResult<TOutput>> => {
    return runStep(component, context);
  } 
}
