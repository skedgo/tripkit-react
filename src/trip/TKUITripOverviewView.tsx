import React from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { default as TKUISegmentOverview } from "./TKUISegmentOverview";
import { tKUITripOverviewViewDefaultStyle } from "./TKUITripOverviewView.css";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { Visibility } from "../model/trip/SegmentTemplate";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import TKShareHelper from "../share/TKShareHelper";
import genStyles from "../css/GenStyle.css";
import TKUIShareAction from "../action/TKUIShareAction";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { TKI18nContextProps, TKI18nContext } from "../i18n/TKI18nProvider";
import HasCard, { HasCardKeys } from "../card/HasCard";
import { ReactComponent as IconNavigation } from "../images/ic-navigation.svg";
import TKUITripTime from "./TKUITripTime";
import TripRowTrack from "./TripRowTrack";
import TKUICardHeader from "../card/TKUICardHeader";

type IStyle = ReturnType<typeof tKUITripOverviewViewDefaultStyle>;
export interface IClientProps extends TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {

    /**
     * @ctype
     */
    value: Trip;

    /**
     * @ignore
     */
    handleRef?: (ref: any) => void;

    /**
     * Function that will run when user hits the 'Alternative routes' button on a cancelled segment.
     * @ctype
     */
    onRequestAlternativeRoutes?: (segment: Segment) => void;

    /**
     * Allows to specify a list action buttons (JSX.Elements) associated with the trip, to be rendered on card header.
     * It receives the trip and the default list of buttons.
     * @ctype (trip: Trip, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share Trip_ and _Add to favourites_ actions, which are instances of [](TKUIButton).
     */
    actions?: (trip: Trip, defaultActions: JSX.Element[]) => JSX.Element[];

    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with a segment, to be rendered on segment
     * detail. It receives the segment and the default list of buttons.
     * @ctype (segment: Segment, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share Arrival_, if segment is the last one, which is an instance of [](TKUIButton).
     */
    segmentActions?: (segment: Segment, defaultActions: JSX.Element[]) => JSX.Element[];
    shouldFocusAfterRender?: boolean;
    doNotStack?: boolean;
    selectedTripSegment?: Segment;
    setSelectedTripSegment?: (segment: Segment) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUITripOverviewViewProps = IProps;
export type TKUITripOverviewViewStyle = IStyle;

export const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripOverviewView {...props} />,
    styles: tKUITripOverviewViewDefaultStyle,
    classNamePrefix: "TKUITripOverviewView"
};

class TKUITripOverviewView extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        this.getDefaultSegmentActions = this.getDefaultSegmentActions.bind(this);
    }

    private getDefaultActions(trip: Trip) {
        return [
            <TKI18nContext.Consumer key={"actionGo"}>
                {(i18nProps: TKI18nContextProps) =>
                    <RoutingResultsContext.Consumer key={"actionFavourite"}>
                        {(routingResultsContext: IRoutingResultsContext) =>
                            <TKUIButton text={i18nProps.t("Go")}
                                icon={<IconNavigation />}
                                type={TKUIButtonType.SECONDARY_VERTICAL}
                                onClick={() => routingResultsContext.setSelectedTripSegment(this.props.value.getSegments(Visibility.IN_DETAILS)[0])}
                            />}
                    </RoutingResultsContext.Consumer>
                }
            </TKI18nContext.Consumer>,
            <RoutingResultsContext.Consumer key={"actionFavourite"}>
                {(routingResultsContext: IRoutingResultsContext) =>
                    routingResultsContext.query.from && routingResultsContext.query.to &&
                    <TKUIFavouriteAction
                        favourite={FavouriteTrip.create(routingResultsContext.query.from, routingResultsContext.query.to)}
                        vertical={true}
                    />}
            </RoutingResultsContext.Consumer>,
            <TKI18nContext.Consumer key={"actionShare"}>
                {(i18nProps: TKI18nContextProps) =>
                    <TKUIShareAction
                        title={i18nProps.t("Share.Trip")}
                        message={""}
                        link={() => TripGoApi.apiCallUrl(trip.saveURL, NetworkUtil.MethodType.GET).then((json: any) => json.url)}
                        vertical={true}
                    />
                }
            </TKI18nContext.Consumer>
        ];
    }

    private getDefaultSegmentActions(segment: Segment) {
        const props = this.props;
        return segment.arrival ? [
            <TKUIShareAction title={props.t("Share.Arrival")}
                link={TKShareHelper.getShareSegmentArrival(segment)}
                message={""}
                buttonType={TKUIButtonType.PRIMARY_LINK}
                style={{
                    paddingLeft: 0,
                    ...genStyles.justifyStart
                }}
                key={"actionShareArrival"}
            />
        ] : []
    }

    public render(): React.ReactNode {
        const segments = this.props.value.getSegments(Visibility.IN_DETAILS);
        const { value: trip } = this.props;
        const classes = this.props.classes;
        const defaultActions = this.getDefaultActions(trip);
        const actions = this.props.actions ? this.props.actions(trip, defaultActions) : defaultActions;
        const hideTimes = trip.hideExactTimes;
        const subHeader = () =>
            <div className={classes.header}>
                <div style={{ marginLeft: '10px' }}>
                    <TripRowTrack value={trip} />
                </div>
                {actions &&
                    <TKUIActionsView actions={actions} className={classes.actionsPanel} />}
            </div>;
        const segmentsAndArrival = segments.concat(this.props.value.arrivalSegment);
        return (
            <TKUICard
                renderHeader={props =>
                    <TKUICardHeader {...props}
                        title={!hideTimes &&
                            <TKUITripTime
                                styles={{
                                    timePrimary: overrideClass({ lineHeight: '28px' }),
                                    timeSecondary: overrideClass({ lineHeight: '28px' })
                                }}
                                value={trip}
                            />
                        }
                    />}
                renderSubHeader={subHeader}
                onRequestClose={this.props.onRequestClose}
                presentation={this.props.cardPresentation !== undefined ? this.props.cardPresentation : CardPresentation.SLIDE_UP}
                handleRef={this.props.handleRef}
                slideUpOptions={this.props.slideUpOptions}
                ariaLabel={trip.mainSegment?.modeInfo ? trip.mainSegment.modeInfo.alt + " Trip Details" : undefined}
                shouldFocusAfterRender={this.props.shouldFocusAfterRender}
                doNotStack={this.props.doNotStack}
            >
                <div className={classes.main}>
                    {segmentsAndArrival.map((segment: Segment, index: number) => {
                        const defaultSegmentActions = this.getDefaultSegmentActions(segment);
                        const segmentActions = this.props.segmentActions ?
                            this.props.segmentActions(segment, defaultSegmentActions) : defaultSegmentActions;
                        return <TKUISegmentOverview
                            value={segment}
                            key={index}
                            actions={segmentActions}
                            onRequestAlternativeRoutes={this.props.onRequestAlternativeRoutes}
                            onClick={() => this.props.setSelectedTripSegment && this.props.setSelectedTripSegment(segment)}
                        />;
                    }
                    )}
                </div>
            </TKUICard>
        )
    }
}

/**
 * Show details for a trip as an overview
 */

export default connect((config: TKUIConfig) => config.TKUITripOverviewView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));