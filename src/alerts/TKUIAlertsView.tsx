import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import RealTimeAlert from "../model/service/RealTimeAlert";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIAlertsViewDefaultStyle} from "./TKUIAlertsView.css";
import {CardPresentation, default as TKUICard} from "../card/TKUICard";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import {ReactComponent as AlertIcon} from "../images/ic-alert.svg";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    alerts: RealTimeAlert[];
    slideUpOptions?: TKUISlideUpOptions;
    onRequestClose?: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    alert: CSSProps<IProps>;
    content: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
    title: CSSProps<IProps>;
    text: CSSProps<IProps>;
}

export type TKUIAlertsViewProps = IProps;
export type TKUIAlertsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIAlertsView {...props}/>,
    styles: tKUIAlertsViewDefaultStyle,
    classNamePrefix: "TKUIAlertsView"
};

class TKUIAlertsView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const t = this.props.t;
        const alerts = this.props.alerts;
        return (
            <TKUICard
                title={t("Alerts")}
                presentation={CardPresentation.SLIDE_UP}
                slideUpOptions={this.props.slideUpOptions}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>
                    {alerts.map((alert: RealTimeAlert) =>
                        <div className={classes.alert}>
                            <AlertIcon className={classes.alertIcon}/>
                            <div className={classes.content}>
                                <div className={classes.title}>
                                    {alert.title}
                                </div>
                                <div className={classes.text}>
                                    {alert.text}
                                </div>
                            </div>
                        </div>)}
                </div>
            </TKUICard>
        )
    }

}

export default connect((config: TKUIConfig) => config.TKUIAlertsView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));