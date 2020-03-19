import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import RealTimeAlert from "../model/service/RealTimeAlert";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIAlertsSummaryDefaultStyle} from "./TKUIAlertsSummary.css";
import {ReactComponent as AlertIcon} from "../images/ic-alert.svg";
import {ReactComponent as IconRightArrow} from "../images/ic-angle-right.svg";
import TKUIAlertsView from "./TKUIAlertsView";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    alerts: RealTimeAlert[];
    slideUpOptions?: TKUISlideUpOptions;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
    numOfAlerts: CSSProps<IProps>;
    alertTitle: CSSProps<IProps>;
}

export type TKUIAlertsSummaryProps = IProps;
export type TKUIAlertsSummaryStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIAlertsSummary {...props}/>,
    styles: tKUIAlertsSummaryDefaultStyle,
    classNamePrefix: "TKUIAlertsSummary"
};

interface IState {
    showAlertsView: boolean;
}

class TKUIAlertsSummary extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            showAlertsView: false
        };
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const t = this.props.t;
        const alerts = this.props.alerts;
        return (
            <div className={classes.main}>
                <div className={classes.header} onClick={() => this.setState({showAlertsView: true})}>
                    <AlertIcon className={classes.alertIcon}/>
                    <span className={classes.numOfAlerts}>
                        {t("X.alerts", {0: alerts.length})}
                    </span>
                    <IconRightArrow/>
                </div>
                {alerts.map((alert: RealTimeAlert) =>
                    <div className={classes.alertTitle}>
                        {alert.title}
                    </div>
                )}
                {this.state.showAlertsView &&
                <TKUIAlertsView
                    alerts={alerts}
                    onRequestClose={() => this.setState({showAlertsView: false})}
                    slideUpOptions={{
                        draggable: false,
                        ...this.props.slideUpOptions
                    }}
                />}
            </div>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUIAlertsSummary, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));