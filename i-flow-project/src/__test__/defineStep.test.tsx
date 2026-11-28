import { describe, expect, it, vi, type Mock } from "vitest";
import { render } from "@testing-library/react";
import { defineStep } from "../lib/react";
import type { StepView } from "../lib/react/types/StepView.types";

describe("defineStepを使用する", () => {
  it("contextが渡されていない場合に {} を返す。", () => {
    const ViewMock: Mock<StepView> = vi.fn(() => <></>);

    const StepComponent = defineStep<{ id: number }, {}>({
      name: "sampleStep",
      View: ViewMock
    });

    render(<StepComponent />);
    expect(ViewMock).toHaveBeenCalledTimes(1);
    expect(ViewMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ context: {} })
    );
  });

  it("defineStepが正常にレンダリングできる", () => {
    const StepComponent = defineStep<{}, {}>({
      name: "stepComponent",
      View: ({}) => {
        return <></>;
      }
    });

    expect(
      () => render(<StepComponent />)
    ).not.Throw();
  });
});
