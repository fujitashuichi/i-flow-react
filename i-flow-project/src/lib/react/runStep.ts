import type { StepComponent, StepResult } from "./interface/ReactFlow.types";

export const runStep = async <TInput, TOutput>(
  stepComponent: StepComponent<TInput, TOutput>,
  context?: TInput
): Promise<StepResult<TOutput>> => {
  let resolveOutput: (output: TOutput) => void;

  const outputPromise = new Promise<TOutput>((resolve) => {
    resolveOutput = resolve
  });

  const component = await stepComponent({
    context,
    next: (output: TOutput) => resolveOutput(output)
  });

  const output = await outputPromise;

  return {
    output,
    component
  }
}
