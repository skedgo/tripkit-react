import * as React from "react";
import {default as TKUICard, TKUICardClientProps} from "./TKUICard";
import Util from "../util/Util";

interface IProps {
    children: (setProps: (props: TKUICardClientProps) => void) => React.ReactNode;
}

interface IState {
    props: TKUICardClientProps
}

class TKUIControlsCard extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            props: {}
        }
    }

    public render(): React.ReactNode {
        return (
            [
                <div key={1}>
                    {this.props.children((props: TKUICardClientProps) => {
                        this.setState((prev: IState) => ({
                            props: Util.iAssign(prev.props, props)
                        }))
                    })}
                </div>,
                this.state.props.children &&
                <TKUICard
                    {...this.state.props}
                    key={2}
                />
            ]
        );
    }

}

export default TKUIControlsCard;