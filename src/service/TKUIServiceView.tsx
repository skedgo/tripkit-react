import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { EventEmitter } from "fbemitter";
import { IServiceResultsContext, ServiceResultsContext } from "./ServiceResultsProvider";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIServiceViewDefaultStyle } from "./TKUIServiceView.css";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import TransportUtil from "../trip/TransportUtil";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { Subtract } from "utility-types";
import TKShareHelper from "../share/TKShareHelper";
import TKUIShareAction from "../action/TKUIShareAction";
import TKUIActionsView from "../action/TKUIActionsView";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import { IOptionsContext, OptionsContext } from "../options/OptionsProvider";
import TKUserProfile from "../model/options/TKUserProfile";
import TKUIServiceSteps from "../trip/TKUIServiceSteps";
import TKUIServiceRealtimeInfo from "./TKUIServiceRealtimeInfo";
import HasCard, { HasCardKeys } from "../card/HasCard";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.cardPresentation> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
    actions?: (service: ServiceDeparture, defaultActions: JSX.Element[]) => JSX.Element[];
}

interface IStyle {
    main: CSSProps<IProps>;
    serviceOverview: CSSProps<IProps>;
    pastStop: CSSProps<IProps>;
    currStop: CSSProps<IProps>;
    currStopMarker: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
}

interface IConsumedProps {
    title: string,
    departure: ServiceDeparture;
    eventBus?: EventEmitter;
    options: TKUserProfile
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIServiceViewProps = IProps;
export type TKUIServiceViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIServiceView {...props} />,
    styles: tKUIServiceViewDefaultStyle,
    classNamePrefix: "TKUIServiceView",
    randomizeClassNames: true,  // This needs to be true since multiple instances are rendered,
    // each with a different service color.
};

interface IState {
    realtimeOpen: boolean;
}

export const STOP_CLICKED_EVENT = "stopClicked";

class TKUIServiceView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            realtimeOpen: false
        };
        this.getDefaultActions = this.getDefaultActions.bind(this);
    }

    private scrollRef: any;
    private scrolledIntoView = false;

    private getDefaultActions(service: ServiceDeparture) {
        return [
            <TKUIShareAction
                title={this.props.t("Share")}
                message={""}
                link={TKShareHelper.getShareService(service)}
                vertical={true}
                key={"actionShareService"}
            />
        ]
    }

    public render(): React.ReactNode {
        const { departure, classes, t } = this.props;
        const defaultActions = this.getDefaultActions(departure);
        const actions = this.props.actions ? this.props.actions(departure, defaultActions) : defaultActions;
        const actionElems = actions ?
            <TKUIActionsView
                actions={actions}
                className={classes.actionsPanel}
            /> : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        return (
            <TKUICard
                title={departure.lineText ?? t("Service")}
                onRequestClose={this.props.onRequestClose}
                renderSubHeader={() =>
                    <div className={this.props.classes.serviceOverview} id="serviceViewHeader">
                        <TKUIServiceDepartureRow
                            value={this.props.departure}
                            detailed={true}
                            showLineText={false}
                        />
                        <TKUIServiceRealtimeInfo
                            wheelchairAccessible={departure.isWheelchairAccessible()}
                            vehicle={departure.realtimeVehicle}
                            alerts={departure.hasAlerts ? departure.alerts : undefined}
                            modeInfo={departure.modeInfo}
                            options={this.props.options}
                            alertsSlideUpOptions={this.props.slideUpOptions && { modalUp: this.props.slideUpOptions.modalUp }}
                        />
                        {actionElems}
                    </div>
                }
                presentation={this.props.cardPresentation || CardPresentation.SLIDE_UP}
                slideUpOptions={slideUpOptions}
                scrollRef={(scrollRef: any) => this.scrollRef = scrollRef}
            >
                <div className={classes.main}>
                    {departure.serviceDetail?.shapes &&
                        <TKUIServiceSteps
                            steps={departure.serviceDetail.shapes}
                            serviceColor={TransportUtil.getServiceDepartureColor(departure)}
                            timezone={departure.startTimezone}
                        />}
                </div>
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!this.scrolledIntoView && this.props.departure.serviceDetail && this.scrollRef) {
            this.scrolledIntoView = true;
            const classes = this.props.classes;
            this.scrollRef.getElementsByClassName("TKUIServiceSteps-firstTravelledStop")[0].scrollIntoView();
        }
    }
}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
    return (
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) => (
                        props.children!({
                            title: serviceContext.title,
                            departure: serviceContext.selectedService!,
                            eventBus: serviceContext.servicesEventBus,
                            options: optionsContext.userProfile
                        })
                    )}
                </ServiceResultsContext.Consumer>
            }
        </OptionsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...consumedProps, ...inputProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIServiceView, config, Mapper);