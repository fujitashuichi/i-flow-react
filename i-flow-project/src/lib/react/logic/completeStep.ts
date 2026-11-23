import type { StepPayload } from "../types/common.types";
import type { Complete } from "../types/StepComponent.types";

export const completeStep: Complete<StepPayload> = <
  TOutput extends StepPayload
>(
  output: TOutput
) => {
  console.debug("'complete' function called.");
  return output;
}
