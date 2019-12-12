import * as React from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import {CSSProperties} from "react";
import TKUICard, {CardPresentation, TKUICardClientProps} from "../card/TKUICard";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {default as TKUISegmentOverview} from "./TKUISegmentOverview";
import {tKUITripOverviewViewDefaultStyle} from "./TKUITripOverviewView.css";
import TripUtil from "./TripUtil";
import {Observable} from 'rxjs';
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconDirections} from "../images/ic-directions.svg";
import {Visibility} from "../model/trip/SegmentTemplate";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TKUIShareView from "../share/TKUIShareView";
import TKUIControlsCard from "../card/TKUIControlsCard";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import TKShareHelper from "../share/TKShareHelper";
import genStyles from "../css/GenStyle.css";
import TKUIShareAction from "../action/TKUIShareAction";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    onRequestClose?: () => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (trip: Trip) => JSX.Element[];
    segmentActions?: (segment: Segment) => JSX.Element[];
}

export type TKUITripOverviewViewProps = IProps;
export type TKUITripOverviewViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripOverviewView {...props}/>,
    styles: tKUITripOverviewViewDefaultStyle,
    classNamePrefix: "TKUITripOverviewView",
    props: {
        actions: (trip: Trip) => [
            <TKUIButton text={"Go"} icon={<IconDirections/>} type={TKUIButtonType.PRIMARY_VERTICAL} style={{minWidth: '90px'}}/>,
            <RoutingResultsContext.Consumer>
                {(routingResultsContext: IRoutingResultsContext) =>
                    routingResultsContext.query.from && routingResultsContext.query.to &&
                    <TKUIFavouriteAction
                        favourite={FavouriteTrip.create(routingResultsContext.query.from, routingResultsContext.query.to)}
                        vertical={true}
                    />}
            </RoutingResultsContext.Consumer>,
            <TKUIShareAction
                title={"Share trip"}
                message={""}
                link={() => TripGoApi.apiCallUrl(trip.saveURL, NetworkUtil.MethodType.GET).then((json: any) => json.url)}
                vertical={true}
            />
        ],
        segmentActions: (segment: Segment) => segment.arrival ? [
            <TKUIControlsCard>
                {(setProps: (props: TKUICardClientProps) => void) => {
                    return <TKUIButton text={"Share arrival"}
                                       type={TKUIButtonType.PRIMARY_LINK}
                                       style={{
                                           paddingLeft: 0,
                                           ...genStyles.justifyStart
                                       }}
                                       onClick={() => {
                                           setProps({
                                               title: "Share arrival",
                                               presentation: CardPresentation.MODAL,
                                               children:
                                                   <TKUIShareView
                                                       link={TKShareHelper.getShareSegmentArrival(segment)}
                                                       customMsg={""}
                                                   />,
                                               open: true,
                                               onRequestClose: () => {
                                                   setProps({
                                                       open: false
                                                   })
                                               }
                                           });
                                       }}
                    />;
                }}
            </TKUIControlsCard>
        ] : []
    }
};

class TKUITripOverviewView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segments = this.props.value.getSegments(Visibility.IN_DETAILS)
            .filter((segment: Segment) => !segment.isStationay());
        const trip = this.props.value;
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(trip);
        const title = hasPT ? departureTime + " - " + arrivalTime : duration;
        const subtitle = hasPT ? duration : (trip.queryIsLeaveAfter ? "Arrives " + arrivalTime : "Departs " + departureTime);
        const classes = this.props.classes;
        const subHeader = this.props.actions ?
            () => <TKUIActionsView actions={this.props.actions!(trip)} className={classes.actionsPanel}/> : undefined;
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                renderSubHeader={subHeader}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>
                    {segments.map((segment: Segment, index: number) =>
                        <TKUISegmentOverview
                            value={segment}
                            key={index}
                            actions={this.props.segmentActions && this.props.segmentActions(segment)}
                        />
                    )}

                    <TKUISegmentOverview
                        value={this.props.value.arrivalSegment}
                        key={segments.length}
                        actions={this.props.segmentActions && this.props.segmentActions(this.props.value.arrivalSegment)}
                    />
                </div>
            </TKUICard>
        )
    }
}

export default connect((config: TKUIConfig) => config.TKUITripOverviewView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));