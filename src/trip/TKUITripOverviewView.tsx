import React, {CSSProperties} from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {default as TKUISegmentOverview} from "./TKUISegmentOverview";
import {tKUITripOverviewViewDefaultStyle} from "./TKUITripOverviewView.css";
import TripUtil from "./TripUtil";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIActionsView from "../action/TKUIActionsView";
import {TKUIButtonType} from "../buttons/TKUIButton";
import {Visibility} from "../model/trip/SegmentTemplate";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import TKShareHelper from "../share/TKShareHelper";
import genStyles from "../css/GenStyle.css";
import TKUIShareAction from "../action/TKUIShareAction";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    onRequestClose?: () => void;
    handleRef?: (ref: any) => void;
    slideUpOptions?: TKUISlideUpOptions;
    cardPresentation?: CardPresentation;
    onRequestAlternativeRoutes?: (segment: Segment) => void;
    /**
     * Allows to specify a list action buttons (JSX.Elements) associated with the trip, to be rendered on card header.
     * It receives the trip and the default list of buttons.
     * @ctype (trip: Trip, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share Trip_ and _Add to favourites_ actions.
     */
    actions?: (trip: Trip, defaultActions: JSX.Element[]) => JSX.Element[];
    /**
     * Allows to specify a list action buttons (JSX.Elements) associated with a segment, to be rendered on segment
     * detail. It receives the segment and the default list of buttons.
     * @ctype (segment: Segment, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Share Arrival_, if segment is the last one.
     */
    segmentActions?: (segment: Segment, defaultActions: JSX.Element[]) => JSX.Element[];
}

export interface IStyle {
    main: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUITripOverviewViewProps = IProps;
export type TKUITripOverviewViewStyle = IStyle;

export const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripOverviewView {...props}/>,
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
            // <TKI18nContext.Consumer key={"actionGo"}>
            //    {(i18nProps: TKI18nContextProps) =>
            //        <TKUIButton text={i18nProps.t("Go")}
            //                    icon={<IconDirections/>}
            //                    type={TKUIButtonType.PRIMARY_VERTICAL}
            //                    style={{minWidth: '90px'}}
            //        />
            //    }
            //</TKI18nContext.Consumer>,
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
        const segments = this.props.value.getSegments(Visibility.IN_DETAILS)
            .filter((segment: Segment) => !segment.isStationay());
        const trip = this.props.value;
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(trip);
        const title = hasPT ? departureTime + " - " + arrivalTime : duration;
        const subtitle = hasPT ? duration : (trip.queryIsLeaveAfter ? "Arrives " + arrivalTime : "Departs " + departureTime);
        const classes = this.props.classes;
        const defaultActions = this.getDefaultActions(trip);
        const actions = this.props.actions ? this.props.actions(trip, defaultActions) : defaultActions;
        const subHeader = actions ?
            () => <TKUIActionsView actions={actions} className={classes.actionsPanel}/> : undefined;
        const segmentsAndArrival = segments.concat(this.props.value.arrivalSegment);
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                renderSubHeader={subHeader}
                onRequestClose={this.props.onRequestClose}
                presentation={this.props.cardPresentation !== undefined ? this.props.cardPresentation : CardPresentation.SLIDE_UP}
                handleRef={this.props.handleRef}
                slideUpOptions={this.props.slideUpOptions}
                ariaLabel={trip.mainSegment.modeInfo ? trip.mainSegment.modeInfo.alt + " Trip Details" : undefined}
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