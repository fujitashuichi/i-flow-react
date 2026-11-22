import type { StepPayload } from "../interface/common.types";
import type { DefineStep, DefineStepProps } from "../interface/DefineStepComponent.types";
import type { StepComponent } from "../interface/ReactFlow.types";

export const defineStep: DefineStep = <
    TContext extends StepPayload,
    TOutput extends StepPayload
>(
    { name, view }: DefineStepProps<TContext, TOutput>
) => {
    const component: StepComponent<TContext, TOutput> = ({ context, complete }) => {
        const handleComplete = (output: TOutput) => complete(output);

        return (
            <>{view}</>
        )
    };

    return component;
};


defineStep<{}, { name: string }>({
    name: "name",
    view: ({ complete }) => {
        return (
            <input
                onSubmit={(e) => complete({ name: e.currentTarget.value })}
            />
        )
    }
})