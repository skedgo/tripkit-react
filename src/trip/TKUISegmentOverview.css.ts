import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUISegmentOverviewProps, TKUISegmentOverviewStyle} from "./TKUISegmentOverview";
import genStyles from "../css/GenStyle.css";
import TransportUtil from "./TransportUtil";
import Segment from "../model/trip/Segment";

export const tKUISegmentOverviewDefaultStyle: TKUIStyles<TKUISegmentOverviewStyle, TKUISegmentOverviewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column
        },
        header: {
            ...genStyles.flex,
            ...genStyles.alignStretch
        },
        title: {
            fontWeight: '600',
            ...genStyles.fontM,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center,
            ...genStyles.grow
        },
        subtitle: {
            ...genStyles.fontS,
            color: tKUIColors.black1,
            fontWeight: 'normal'
        },
        time: {
            color: tKUIColors.black1,
            margin: '0 16px',
            ...genStyles.fontS,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center
        },
        track: {
            width: '56px',
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter,
            ...genStyles.column,
            ...genStyles.noShrink
        },
        body: {
            ...genStyles.flex
        },
        preLine: {
            borderLeft: (props: TKUISegmentOverviewProps) => {
                let prevSegment = props.value.prevSegment();
                if (prevSegment && prevSegment.isStationay()) { // Skip stationary segment.
                    prevSegment = prevSegment.prevSegment();
                }
                return prevSegment ? '4px solid ' + TransportUtil.getTransportColor(prevSegment.modeInfo!) : 'none';
            },
            ...genStyles.grow
        },
        line: {
            borderLeft: (props: TKUISegmentOverviewProps) =>
                '4px solid ' + TransportUtil.getTransportColor(props.value.modeInfo!),
            ...genStyles.grow
        },
        posLine: {
            borderLeft: (props: TKUISegmentOverviewProps) =>
                !props.value.arrival ? '4px solid ' + TransportUtil.getTransportColor(props.value.modeInfo!) : 'none',
            ...genStyles.grow
        },
        noLine: {
            ...genStyles.grow
        },
        circle: {
            width: '16px',
            height: '16px',
            border: (props: TKUISegmentOverviewProps) => {
                const segment = props.value;
                let prevSegment = segment.prevSegment();
                // This is since stationary segments are skipped on TKUITripOverviewView (since are merged with current segment)
                if (prevSegment && prevSegment.isStationay()) {
                    prevSegment = prevSegment.prevSegment();
                }
                const colourSegment = !segment.isWalking() && !segment.isStationay() ? segment : prevSegment;
                return colourSegment ? '4px solid ' + TransportUtil.getTransportColor(colourSegment.modeInfo!) : 'none';
            },
            ...genStyles.borderRadius(50, "%")
        },
        iconPin: {
            opacity: '.6',
            width: '24px',
            height: '24px',
        },
        icon: {
            background: (props: TKUISegmentOverviewProps) => {
                const modeInfo = props.value.modeInfo!;
                const iconOnDark = isIconOnDark(props.value);
                let transportColor = TransportUtil.getTransportColor(modeInfo);
                if (!transportColor) {
                    transportColor = 'black'
                }
                return iconOnDark ? transportColor : 'none';
            },
            padding: (props: TKUISegmentOverviewProps) => isIconOnDark(props.value) ? '3px' : '0',
            opacity: (props: TKUISegmentOverviewProps) => {
                const modeInfo = props.value.modeInfo!;
                return isIconOnDark(props.value) || modeInfo.remoteIcon ? '1' : '.6';
            },
            width: '24px!important',
            height: '24px',
            ...genStyles.borderRadius(50, '%')
        },
        description: {
            padding: '10px 0',
            margin: '10px 16px 10px 0',
            borderTop: '1px solid ' + tKUIColors.black4,
            borderBottom: '1px solid ' + tKUIColors.black4,
            ...genStyles.grow,
        },
        action: {
            fontWeight: '600',
            ...genStyles.fontM,
        },
        notes: {
            ...genStyles.fontS,
            color: tKUIColors.black1
        },
        occupancy: {
            marginBottom: '4px',
            ...genStyles.flex
        }
    });

export function isIconOnDark(segment: Segment): boolean {
    const modeInfo = segment.modeInfo!;
    return (!!modeInfo.remoteDarkIcon || !modeInfo.remoteIcon) && !segment.isWalking() && !segment.isStationay();
}