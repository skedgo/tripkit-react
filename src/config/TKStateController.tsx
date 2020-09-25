import * as React from "react";
import TKStateConsumer from "./TKStateConsumer";
import {TKState} from "./TKState";

interface IClientProps {
    onInit?: (state: TKState) => void;
    onUpdate?: (state: TKState, prevState: TKState) => void;
}

interface IConsumedProps {
    state: TKState;
}

interface IProps extends IClientProps, IConsumedProps {}

class TKStateController extends React.Component<IProps,{}> {

    public render() {
        return null;
    }

    public componentDidMount() {
        this.props.onInit && this.props.onInit(this.props.state);
    }

    public componentDidUpdate(prevProps: IProps) {
        this.props.onUpdate && this.props.onUpdate(this.props.state, prevProps.state);
    }

}

const TKStateControllerConnected = (props: IClientProps) =>
    <TKStateConsumer>
        {(state: TKState) =>
            <TKStateController {...props} state={state}/>}
    </TKStateConsumer>;

export default TKStateControllerConnected;