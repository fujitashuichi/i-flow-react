import type { StepPayload } from "../../react/types/common.types";

export type ContextRecord = Array<
  {
    name: string,
    context: StepPayload
  }
>;
