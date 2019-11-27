import * as React from "react";

interface IProps {
    actions: JSX.Element[];
    className?: string;
}

class TKUIActionsView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <div className={this.props.className}>
                {this.props.actions}
            </div>
        );
    }

}

export default TKUIActionsView;