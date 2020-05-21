import * as React from "react";
import {TKUIButtonType, TKUIButton} from "../../../index";
import {TKI18nContextProps, TKI18nContext} from "../../../i18n/TKI18nProvider";
import TGUIFeedbackForm from "./TGUIFeedbackForm";

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
            <TKI18nContext.Consumer>
                {(i18nProps: TKI18nContextProps) =>
                    [
                        <TKUIButton text={this.props.actionTitle}
                                    type={TKUIButtonType.PRIMARY}
                                    onClick={() => this.setState({showForm: true})}
                                    key={0}
                        />,
                        this.state.showForm &&
                        <TGUIFeedbackForm
                            titleDefault={this.props.formTitle}
                            msgDefault={this.props.formMessage}
                            onRequestClose={() => this.setState({showForm: false})} key={1}
                        />
                    ]
                }
            </TKI18nContext.Consumer>
        );
    }

}

export default RequestSupportAction;