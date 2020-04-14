import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import RealTimeAlert from "../model/service/RealTimeAlert";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {tKUIAlertsViewDefaultStyle} from "./TKUIAlertsView.css";
import {CardPresentation, TKUICardClientProps} from "../card/TKUICard";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import {ReactComponent as AlertIcon} from "../images/ic-alert.svg";
import TKUIRendersCard from "../card/TKUIRendersCard";
import {Subtract} from "utility-types";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    alerts: RealTimeAlert[];
    slideUpOptions?: TKUISlideUpOptions;
    onRequestClose?: () => void;
}

interface IConsumedProps {
    renderCard: (props: TKUICardClientProps, id: any) => void;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

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

    constructor(props: IProps) {
        super(props);
        this.renderCard = this.renderCard.bind(this);
        this.renderCard(true);
    }

    /**
     * Call this function on construction and update, instead on render, since if on the latter a warn is triggered
     * by react that a render shouldn't have a collateral effect.
     */
    private renderCard(open: boolean) {
        const classes = this.props.classes;
        const t = this.props.t;
        const alerts = this.props.alerts;
        this.props.renderCard({
            title: t("Alerts"),
            presentation: CardPresentation.SLIDE_UP,
            slideUpOptions: this.props.slideUpOptions,
            onRequestClose: this.props.onRequestClose,
            open: open,
            children:
                <div className={classes.main}>
                    {alerts.map((alert: RealTimeAlert, i: number) =>
                        <div className={classes.alert} key={i}>
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
        }, this);
    }

    public render(): React.ReactNode {
        return null;
    }

    public componentDidUpdate() {
        this.renderCard(true);
    }

    public componentWillUnmount() {
        this.renderCard(false);
    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIRendersCard>
            {(renderCard: (props: TKUICardClientProps, id: any) => void) =>
                children!({
                    ...inputProps,
                    renderCard: renderCard
                })
            }
        </TKUIRendersCard>;

export default connect((config: TKUIConfig) => config.TKUIAlertsView, config, Mapper);