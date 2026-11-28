import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { defineStep } from "../lib/react";

describe("defineStepを使用する", () => {
  it("contextが渡されていない場合に {} を返す。", () => {
    defineStep<{ id: number }, {}>({
      name: "sampleStep",
      View: ({ context }) => {
        expect(context).toBe({});
        return <></>;
      }
    })
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
