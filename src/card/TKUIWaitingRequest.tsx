import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIWaitingDefaultStyle} from "./TKUIWaitingRequest.css";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {ReactComponent as IconTick} from '../images/ic-tick.svg';
import {ReactComponent as IconCross} from '../images/ic-cross2.svg';

// TODO: refactor it as a more general component that displays messages up-front.
// Maybe add property blocking?: boolean.

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

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (this.props.status !== undefined &&
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

}

export default connect((config: TKUIConfig) => config.TKUIWaitingRequest, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));