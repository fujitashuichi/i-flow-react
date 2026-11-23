import type { FlowComponent } from "../types/FlowComponent.types"

export const Flow: FlowComponent = ({
    initialContext, children
}) => {
    if (!children) {
        return;
    }

    return (
        <>
            <h1>Flow</h1>
            {children}
        </>
    )
}
