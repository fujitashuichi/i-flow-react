import type { StepPayload } from "../types/common.types";
import type { Complete } from "../types/StepView.types";

export const completeStep: Complete<StepPayload> = <
  TOutput extends StepPayload
>(
  output: TOutput
) => {
  console.debug("'complete' function called.");
  console.debug(`output: ${JSON.stringify(output)}`)
  return output;
}
