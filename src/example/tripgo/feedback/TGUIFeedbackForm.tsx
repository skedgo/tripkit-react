import * as React from "react";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../../../util/TKUIResponsiveUtil";
import TKUICard, {CardPresentation} from "../../../card/TKUICard";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import TKUIWaitingRequest, {TKRequestStatus} from "../../../card/TKUIWaitingRequest";
import {tGUIFeedbackFormDefaultStyle} from "./TGUIFeedbackForm.css";
import {Subtract} from "utility-types";
import TKUIButton, {TKUIButtonType} from "../../../buttons/TKUIButton";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    titleDefault?: string;
    msgDefault?: string;
    msgPlaceholder?: string;
    onRequestClose?: () => void;
}

export interface IConsumedProps extends TKUIViewportUtilProps {}

interface IStyle {
    main: CSSProps<IProps>;
    msgTextArea: CSSProps<IProps>;
    row: CSSProps<IProps>;
    label: CSSProps<IProps>;
    input: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    fieldError: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TGUIFeedbackFormProps = IProps;
export type TGUIFeedbackFormStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TGUIFeedbackForm {...props}/>,
    styles: tGUIFeedbackFormDefaultStyle,
    classNamePrefix: "FeedbackForm"
};

interface IState {
    title: string;
    titleError?: string;
    email: string;
    emailError?: string;
    name: string;
    msg: string;
    validForm: boolean;
    submitStatus?: TKRequestStatus
}


class TGUIFeedbackForm extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            title: this.props.titleDefault || "",
            email: "",
            name: "",
            msg: this.props.msgDefault || "",
            validForm: false
        };
        this.validateTitle = this.validateTitle.bind(this);
        this.validateMail = this.validateMail.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.submit = this.submit.bind(this);
    }

    private validateTitle(): boolean {
        const titleValid = !!this.state.title;
        this.setState({titleError: titleValid ? undefined : "Title is required."});
        return titleValid;
    }

    private validateMail(): boolean {
        const email_pattern = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
        const emailRegex = RegExp(email_pattern);
        const emailValid = emailRegex.test(this.state.email);
        this.setState({emailError: emailValid ? undefined : !this.state.email ? "Email is required." : "Invalid email address."});
        return emailValid;
    }

    private validateForm(): boolean {
        const emailValid = this.validateMail();
        const titleValid = this.validateTitle();
        return emailValid && titleValid;
    }

    private submit() {
        const url = "https://api.tripgo.com/v1/data/email/contact";
        this.setState({ submitStatus: TKRequestStatus.wait});
        fetch(url, {
            method: "POST",
            body: JSON.stringify({
                fromAddress: "noreply@skedgo.com",
                toAddress: "mauro@skedgo.com",
                // toAddress: "support@skedgo.com",
                replyAddress: this.state.email,
                from: (this.state.name ? this.state.name : "Anonymous") + " through TripGo Web-App",
                to: "TripGo Support",
                subject: this.state.title,
                message: this.state.msg.split('\n').join('<br>')
            })
        })
            .then(() => this.setState({submitStatus: TKRequestStatus.success}))
            .catch(() => this.setState({submitStatus: TKRequestStatus.error}))
            .finally(() => {
                setTimeout(() => {
                    this.state.submitStatus === TKRequestStatus.success && this.props.onRequestClose && this.props.onRequestClose();
                    this.setState({submitStatus: undefined});
                }, 3000);
            });
    }

    public render(): React.ReactNode {
        const msgPlaceholder = this.props.msgPlaceholder === undefined ? "Please write your message here" :
            this.props.msgPlaceholder;
        const t = this.props.t;
        const classes = this.props.classes;

        return (
            <TKUICard
                title={t("Request.support")}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                focusTrap={true}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>
                    <div className={classes.row}>
                        <label className={classes.label} htmlFor="fb-title">Title:</label>
                        <input id="fb-title"
                               className={classes.input}
                               value={this.state.title}
                               onChange={(e: any) =>
                                   this.setState({title: e.target.value},
                                       () => {
                                           if (this.state.titleError) {
                                               this.validateTitle();
                                           }
                                       })}
                               placeholder={"(required)"}
                               type="text"
                               spellCheck={false}
                               autoComplete="off"
                               autoCorrect="off"
                               autoCapitalize="off"
                               aria-required="true"
                               aria-invalid={!!this.state.titleError}
                        />
                        {this.state.titleError &&
                        <div className={classes.fieldError} role="alert">
                            {this.state.titleError}
                        </div>}
                    </div>
                    <div className={classes.row}>
                        <label className={classes.label} htmlFor="fb-email">Email:</label>
                        <input id="fb-email"
                               type="email"
                               className={classes.input}
                               placeholder={"(required)"}
                               value={this.state.email}
                               onChange={(e: any) =>
                                   this.setState({email: e.target.value},
                                       () => {
                                           if (this.state.emailError) {
                                               this.setState({emailError: undefined});
                                           }
                                       })}
                               spellCheck={false}
                               autoComplete="email"
                               autoCorrect="off"
                               autoCapitalize="off"
                               aria-required="true"
                               aria-invalid={!!this.state.emailError}
                        />
                        {this.state.emailError &&
                        <div className={classes.fieldError} role="alert">
                            {this.state.emailError}
                        </div>}
                    </div>
                    <div className={classes.row}>
                        <label className={classes.label} htmlFor="fb-name">Name:</label>
                        <input id="fb-name"
                               className={classes.input}
                               placeholder={"Anonymous"}
                               value={this.state.name}
                               onChange={(e: any) => this.setState({name: e.target.value})}
                               type="text"
                               spellCheck={false}
                               autoComplete="name"
                               autoCorrect="off"
                               autoCapitalize="off"
                        />
                    </div>
                    <textarea
                        placeholder={msgPlaceholder}
                        className={classes.msgTextArea}
                        value={this.state.msg}
                        onChange={(e: any) => this.setState({msg: e.target.value})}
                    >
                        {this.state.msg}
                    </textarea>
                    <TKUIButton
                        type={TKUIButtonType.PRIMARY}
                        text={"Send"}
                        // disabled={!this.state.validForm}
                        onClick={() => {
                            if (this.validateForm()) {
                                this.submit();
                            }
                        }}
                    />
                    <div className={classes.footer}>
                        When you post an idea on our forum, others will be able to subscribe to it and make comments.
                        When we respond to the idea, you'll get notified.
                    </div>
                    <TKUIWaitingRequest
                        status={this.state.submitStatus}
                        message={this.state.submitStatus === TKRequestStatus.success ? "Request submitted" :
                            this.state.submitStatus === TKRequestStatus.error ? "Error submitting request" :
                                "Submitting request"}
                    />
                </div>
            </TKUICard>
        );
    }



}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect(() => undefined, config, Mapper);