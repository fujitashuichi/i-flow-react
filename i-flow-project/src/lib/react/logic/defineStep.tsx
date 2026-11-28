import type { StepPayload } from "../types/common.types";
import type { DefineStep, DefineStepProps, StepComponent } from "../types/defineStep.types";
import { completeStep } from "./completeStep";

/**
 * 
 * @example
 * const InputNameStep = defineStep<{}, { name: string }>({
 *  name: "inputName",
 *  View: ({ complete }) => {
 *    return (
 *      <button
 *        onSubmit={(e) => complete({ name: e.currentTarget.value })}
 *      >
 *        submit
 *      </button>
 *    )
 *  }
 * })
 */

export const defineStep: DefineStep = <
  TContext extends StepPayload,
  TOutput extends StepPayload
>(
  { name, View }: DefineStepProps<TContext, TOutput>
) => {
  // contextを履歴から取得する。プロトタイプ思案中は動作しないダミーを置く
  const currentContext = {} as unknown as TContext;
  
  const component: StepComponent = () => {
    return (
      <View context={currentContext} complete={completeStep} />
    )
  };

  return component;
};
