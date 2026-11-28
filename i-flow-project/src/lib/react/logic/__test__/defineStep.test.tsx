import { describe, expect, it, vi, type Mock } from "vitest";
import { defineStep } from "../defineStep";
import { render } from "@testing-library/react";
import type { StepView } from "../../types/StepView.types";

describe("defineStepとContextの整合性", () => {
    it("defineStepはViewにContextを渡す", () => {
        const ViewMock: Mock<StepView> = vi.fn(() => {
            return <></>;
        });

        const StepComponent = defineStep({
            name: "name",
            View: ViewMock
        });

        render(<StepComponent />);

        expect(ViewMock).toHaveBeenCalledTimes(1);
        expect(
            ViewMock.mock.calls[0][0]
        ).toEqual(
            expect.objectContaining({
                context: expect.anything(),
                complete: expect.any(Function)
            })
        );
    });
});
