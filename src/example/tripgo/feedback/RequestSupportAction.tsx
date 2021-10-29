import * as React from "react";
import TGUIFeedbackForm from "./TGUIFeedbackForm";
import TKUIButton, {TKUIButtonType} from "../../../buttons/TKUIButton";

interface IProps {
    actionTitle: string;
    formTitle: string;
    formMessage: string;
}

interface IState {
    showForm: boolean;
}

class RequestSupportAction extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            showForm: false
        };
    }

    public render(): React.ReactNode {
        return (
            <React.Fragment>
                <TKUIButton text={this.props.actionTitle}
                            type={TKUIButtonType.PRIMARY}
                            onClick={() => this.setState({showForm: true})}
                            key={0}
                />
                {this.state.showForm &&
                <TGUIFeedbackForm
                    titleDefault={this.props.formTitle}
                    msgDefault={this.props.formMessage}
                    onRequestClose={() => this.setState({showForm: false})}
                />}
            </React.Fragment>
        );
    }

}

export default RequestSupportAction;