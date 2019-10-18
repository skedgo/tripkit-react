import * as React from "react";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import {CSSProperties} from "react";
import TKUICard from "../card/TKUICard";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {ITKUISegmentOverviewProps, default as TKUISegmentOverview} from "./TKUISegmentOverview";
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

export interface ITKUITripOverviewViewProps extends TKUIWithStyle<ITKUITripOverviewViewStyle, ITKUITripOverviewViewProps> {
    value: Trip;
    onRequestClose?: () => void;
}

interface IProps extends ITKUITripOverviewViewProps {
    classes: ClassNameMap<keyof ITKUITripOverviewViewStyle>
}

export interface ITKUITripOverviewViewStyle {
    main: CSSProps<ITKUITripOverviewViewProps>;
}

export class TKUITripOverviewViewConfig implements TKUIWithStyle<ITKUITripOverviewViewStyle, ITKUITripOverviewViewProps> {
    public styles = tKUITripOverviewViewDefaultStyle;
    public suffixClassNames?: boolean;
    public renderSegmentDetail: <P extends ITKUISegmentOverviewProps & {key: number}>(props: P) => JSX.Element
        = <P extends ITKUISegmentOverviewProps & {key: number}>(props: P) => <TKUISegmentOverview {...props}/>;

    public actions: (trip: Trip) => TKUIAction[] = (trip: Trip) => [
        {
            render: () => <TKUIButton text={"Go"} icon={<IconDirections/>} type={TKUIButtonType.PRIMARY_VERTICAL} style={{minWidth: '90px'}}/>,
            handler: () => {return false}
        },
        new TKUIFavouriteTripAction(FavouriteTrip.create(trip.segments[0]!.from, trip.segments[trip.segments.length - 1]!.from)),
        {
            render: () => <TKUIButton text={"Share arrival"} icon={<IconShare/>} type={TKUIButtonType.SECONDARY_VERTICAL}/>,
            handler: () => {return false}
        }
    ];

    public static instance = new TKUITripOverviewViewConfig();
}

class TKUITripOverviewView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segments = this.props.value.segments;
        const renderSegmentDetail = TKUITripOverviewViewConfig.instance.renderSegmentDetail;
        const trip = this.props.value;
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(trip);
        const title = hasPT ? departureTime + " - " + arrivalTime : duration;
        const subtitle = hasPT ? duration : (trip.queryIsLeaveAfter ? "Arrives " + arrivalTime : "Departs " + departureTime);
        const classes = this.props.classes;
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                renderSubHeader={() => <TKUIActionsView actions={TKUITripOverviewViewConfig.instance.actions(trip)}/>}
                onRequestClose={this.props.onRequestClose}
                asCard={false}
            >
                <div className={classes.main}>
                    {segments.map((segment: Segment, index: number) =>
                        renderSegmentDetail({value: segment, key: index})
                    )}
                    {renderSegmentDetail({value: this.props.value.arrivalSegment, key: segments.length})}
                </div>
            </TKUICard>
        )
    }
}

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent);
    return (props: ITKUITripOverviewViewProps) => {
        const stylesToPass = props.styles || TKUITripOverviewViewConfig.instance.styles;
        const suffixClassNamesToPass = props.suffixClassNames !== undefined ? props.suffixClassNames :
            TKUITripOverviewViewConfig.instance.suffixClassNames;
        return <RawComponentStyled {...props} styles={stylesToPass} suffixClassNames={suffixClassNamesToPass}/>;
    };
};

export default Connect(TKUITripOverviewView);