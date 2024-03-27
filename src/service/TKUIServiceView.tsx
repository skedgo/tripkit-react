import React, { useContext } from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { ServiceResultsContext } from "./ServiceResultsProvider";
import TKUICard, { TKUICardClientProps } from "../card/TKUICard";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIServiceViewDefaultStyle } from "./TKUIServiceView.css";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import TransportUtil from "../trip/TransportUtil";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import TKShareHelper from "../share/TKShareHelper";
import TKUIShareAction from "../action/TKUIShareAction";
import TKUIActionsView from "../action/TKUIActionsView";
import { OptionsContext } from "../options/OptionsProvider";
import TKUserProfile from "../model/options/TKUserProfile";
import TKUIServiceSteps from "../trip/TKUIServiceSteps";
import TKUIServiceRealtimeInfo from "./TKUIServiceRealtimeInfo";
import ServiceDetail from "../model/service/ServiceDetail";

interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps> {
    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with the service, to be rendered on card header.
     * It receives the service and the default list of buttons.
     * @ctype (service: ServiceDeparture, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share_ action, which is an instance of [](TKUIButton).
     */
    actions?: (service: ServiceDeparture, defaultActions: JSX.Element[]) => JSX.Element[];

    /**
     * @ctype TKUICard props
     */
    cardProps?: TKUICardClientProps;

    /**
     * @default true
     */
    initScrollToStop?: boolean;
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
    /**
     * @ctype
     * @order 1
     */
    departure: ServiceDeparture;
    /**
     * @ctype
     * @order 2
     * @divider
     */
    serviceDetail?: ServiceDetail;
    /**
     * @ctype
     * @default {@link TKState#userProfile}
     */
    options?: TKUserProfile
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
        const { departure, serviceDetail, cardProps, classes, t } = this.props;
        const defaultActions = this.getDefaultActions(departure);
        const actions = this.props.actions ? this.props.actions(departure, defaultActions) : defaultActions;
        const actionElems = actions ?
            <TKUIActionsView
                actions={actions}
                className={classes.actionsPanel}
            /> : undefined;
        return (
            <TKUICard
                title={departure.lineText ?? t("Service")}
                renderSubHeader={() =>
                    <div className={this.props.classes.serviceOverview} id="serviceViewHeader">
                        <TKUIServiceDepartureRow
                            value={this.props.departure}
                            detailed={false}
                            showLineText={false}
                        />
                        <TKUIServiceRealtimeInfo
                            wheelchairAccessible={departure.isWheelchairAccessible()}
                            bicycleAccessible={departure.bicycleAccessible}
                            vehicle={departure.realtimeVehicle}
                            alerts={departure.hasAlerts ? departure.alerts : undefined}
                            modeInfo={departure.modeInfo}
                            options={this.props.options}
                            alertsSlideUpOptions={cardProps?.slideUpOptions && { modalUp: cardProps.slideUpOptions.modalUp }}
                        />
                        {actionElems}
                    </div>
                }
                scrollRef={(scrollRef: any) => this.scrollRef = scrollRef}
                {...cardProps}
            >
                <div className={classes.main}>
                    {serviceDetail?.shapes &&
                        <TKUIServiceSteps
                            steps={serviceDetail.shapes}
                            serviceColor={TransportUtil.getServiceDepartureColor(departure)}
                            timezone={departure.startTimezone}
                        />}
                </div>
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.initScrollToStop !== false && !this.scrolledIntoView && this.props.serviceDetail && this.scrollRef) {
            this.scrolledIntoView = true;
            this.scrollRef.getElementsByClassName("TKUIServiceSteps-firstTravelledStop")[0].scrollIntoView();
        }
    }
}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
    const serviceContext = useContext(ServiceResultsContext);
    return (
        <>
            {props.children!({
                departure: serviceContext.selectedService!,
                serviceDetail: serviceContext.selectedService!.serviceDetail
            })}
        </>
    );
};

const Mapper: PropsMapper<IClientProps, IClientProps> =
    ({ inputProps, children }) => {
        const { userProfile } = useContext(OptionsContext);
        return (
            <>
                {children!({ options: userProfile, ...inputProps })}
            </>
        );
    };

export default connect((config: TKUIConfig) => config.TKUIServiceView, config, Mapper);

export const TKUIServiceViewHelpers = {
    TKStateProps: Consumer
}