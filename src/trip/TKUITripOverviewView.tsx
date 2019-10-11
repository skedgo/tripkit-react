import * as React from "react";
import "./TripDetailDelete.css";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import {CSSProperties} from "react";
import TKUICard from "../card/TKUICard";

import {TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {ITKUISegmentOverviewProps, default as TKUISegmentOverview} from "./TKUISegmentOverview";
import {tKUITripOverviewViewDefaultStyle} from "./TKUITripOverviewView.css";
import TripUtil from "./TripUtil";

export interface ITKUITripOverviewViewProps extends TKUIWithStyle<ITKUITripOverviewViewStyle, ITKUITripOverviewViewProps> {
    value: Trip;
    onRequestClose?: () => void;
}

interface IProps extends ITKUITripOverviewViewProps {
    classes: ClassNameMap<keyof ITKUITripOverviewViewStyle>
}

export interface ITKUITripOverviewViewStyle {

}

export class TKUITripOverviewViewConfig implements TKUIWithStyle<ITKUITripOverviewViewStyle, ITKUITripOverviewViewProps> {
    public styles = tKUITripOverviewViewDefaultStyle;
    public suffixClassNames?: boolean;
    public renderSegmentDetail: <P extends ITKUISegmentOverviewProps & {key: number}>(props: P) => JSX.Element
        = <P extends ITKUISegmentOverviewProps & {key: number}>(props: P) => <TKUISegmentOverview {...props}/>;

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
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                onRequestClose={this.props.onRequestClose}
            >
                <div className="TripDetail">
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