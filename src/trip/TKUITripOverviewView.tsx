import * as React from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import {CSSProperties} from "react";
import TKUICard from "../card/TKUICard";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {default as TKUISegmentOverview} from "./TKUISegmentOverview";
import {tKUITripOverviewViewDefaultStyle} from "./TKUITripOverviewView.css";
import TripUtil from "./TripUtil";
import {Observable} from 'rxjs';
import TKUIFavouriteTripAction from "./TKUIFavouriteTripAction";
import FavouriteTrip from "../model/FavouriteTrip";
import TKUIAction from "../action/TKUIAction";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconDirections} from "../images/ic-directions.svg";
import {ReactComponent as IconShare} from "../images/ic-share.svg";
import {Visibility} from "../model/trip/SegmentTemplate";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    onRequestClose?: () => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (trip: Trip) => TKUIAction[];
}

export type TKUITripOverviewViewProps = IProps;
export type TKUITripOverviewViewStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripOverviewView {...props}/>,
    styles: tKUITripOverviewViewDefaultStyle,
    classNamePrefix: "TKUITripOverviewView",
    configProps: {
        actions: (trip: Trip) => [
            {
                render: () => <TKUIButton text={"Go"} icon={<IconDirections/>} type={TKUIButtonType.PRIMARY_VERTICAL} style={{minWidth: '90px'}}/>,
                handler: () => {return false}
            },
            new TKUIFavouriteTripAction(FavouriteTrip.create(trip.segments[0]!.from, trip.segments[trip.segments.length - 1]!.from)),
            {
                render: () => <TKUIButton text={"Share arrival"} icon={<IconShare/>} type={TKUIButtonType.SECONDARY_VERTICAL}/>,
                handler: () => {return false}
            }
        ]
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
        const subHeader = this.props.actions ? () => <TKUIActionsView actions={this.props.actions!(trip)}/> : undefined;
        const classes = this.props.classes;
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                renderSubHeader={subHeader}
                onRequestClose={this.props.onRequestClose}
                asCard={false}
            >
                <div className={classes.main}>
                    {segments.map((segment: Segment, index: number) =>
                        <TKUISegmentOverview
                            value={segment}
                            key={index}
                        />
                    )}

                    <TKUISegmentOverview
                        value={this.props.value.arrivalSegment}
                        key={segments.length}
                    />
                </div>
            </TKUICard>
        )
    }
}

export default connect((config: TKUIConfig) => config.TKUITripOverviewView, config, mapperFromFunction((clientProps: IClientProps) => clientProps))