import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIWaitingDefaultStyle} from "./TKUIWaitingRequest.css";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {ReactComponent as IconTick} from '../images/ic-tick.svg';
import {ReactComponent as IconCross} from '../images/ic-cross2.svg';

export enum TKRequestStatus {
    wait, success, error
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    status?: TKRequestStatus,
    message?: string;
}

export interface IStyle {
    main: CSSProps<IProps>;
    waitingBanner: CSSProps<IProps>;
    waitingMessage: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    iconTick: CSSProps<IProps>;
    iconCross: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIWaitingRequestProps = IProps;
export type TKUIWaitingRequestStyle = IStyle;

interface IState {
    show: boolean;
}

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIWaitingRequest {...props}/>,
    styles: tKUIWaitingDefaultStyle,
    classNamePrefix: "TKUIWaitingRequest"
};

class TKUIWaitingRequest extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            show: false
        };
        this.refreshStatus = this.refreshStatus.bind(this);
    }

    private refreshStatus() {
        if (this.props.status === TKRequestStatus.wait && !this.state.show) {
            this.setState({show: true});
        } else if ((this.props.status === TKRequestStatus.success || this.props.status === TKRequestStatus.error)
            && this.state.show) {
            setTimeout(() => this.setState({show: false}), 1000);
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (this.state.show &&
            <div className={classes.main}>
                <div className={classes.waitingBanner}>
                    <div className={classes.waitingMessage}>
                        {this.props.message}
                    </div>
                    {this.props.status === TKRequestStatus.wait ?
                        <IconSpin className={classes.iconLoading} focusable="false"/> :
                        this.props.status === TKRequestStatus.error ?
                            <IconCross className={classes.iconCross} focusable="false"/> :
                            <IconTick className={classes.iconTick} focusable="false"/> }
                </div>
            </div>
        )
    }

    public componentDidMount() {
        this.refreshStatus();
    }

    public componentDidUpdate(prevProps: IProps) {
        if (this.props.status !== prevProps.status) {
            this.refreshStatus();
        }
    }

}

export default connect((config: TKUIConfig) => config.TKUIWaitingRequest, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));