import * as React from "react";
import TKUIAction from "./TKUIAction";

interface IProps {
    action: TKUIAction;
}

class TKUIActionView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const action = this.props.action;
        return (
            <div
                    // aria-label={"Add to favourites"}
                    // aria-pressed={exists}
                    onClick={() => {
                        action.handler() && this.forceUpdate();
                    }}>
                {action.render()}
            </div>
        );
    }

    public componentDidMount(): void {
        // Observe changes in action to force a component update, which will re-render, obtaining action attributes again.
        if (this.props.action.actionUpdate) {
            const self = this;
            this.props.action.actionUpdate.subscribe({
                next() {
                    self.forceUpdate();
                }
            })
        }
    }

}

export default TKUIActionView;