import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUISegmentOverviewProps, TKUISegmentOverviewStyle} from "./TKUISegmentOverview";
import genStyles from "../css/GenStyle.css";
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
            ...genStyles.grow,
            margin: '10px 0'
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
        preTime: {
            marginBottom: 'auto'
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
                return !prevSegment || isUnconnected(prevSegment) ? undefined :
                    '4px solid ' + prevSegment.getColor();
            },
            ...genStyles.grow
        },
        line: {
            borderLeft: (props: TKUISegmentOverviewProps) =>
                isUnconnected(props.value) ? undefined :
                    '4px solid ' + props.value.getColor(),
            ...genStyles.grow
        },
        posLine: {
            borderLeft: (props: TKUISegmentOverviewProps) =>
                props.value.arrival || isUnconnected(props.value) ? undefined :
                    '4px solid ' + props.value.getColor(),
            ...genStyles.grow
        },
        noLine: {
            ...genStyles.grow
        },
        circle: {
            width: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            height: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            border: (props: TKUISegmentOverviewProps) => {
                const segment = props.value;
                let prevSegment = segment.prevSegment();
                // This is since stationary segments are skipped on TKUITripOverviewView (since are merged with current segment)
                if (prevSegment && prevSegment.isStationay()) {
                    prevSegment = prevSegment.prevSegment();
                }
                const colourSegment = !segment.isWalking() && !segment.isWheelchair() && !segment.isStationay() ? segment : prevSegment;
                return colourSegment ? '4px solid ' + colourSegment.getColor() : 'none';
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
                const iconOnDark = isIconOnDark(props.value);
                let transportColor = props.value.getColor();
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
            marginRight: '16px',
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
        },
        alertsSummary: {
            marginTop: '8px'
        },
        cancelledBanner: {
            background: theme.colorWarning,
            padding: '15px 30px',
            ...genStyles.flex,
            ...genStyles.column
        },
        cancelledMsg: {
            ...genStyles.fontM,
            marginBottom: '10px'
        }
    });

export function isIconOnDark(segment: Segment): boolean {
    const modeInfo = segment.modeInfo!;
    return !modeInfo.remoteIcon
        && !segment.isWalking() && !segment.isWheelchair() && !segment.isStationay();
}

export function isUnconnected(segment: Segment):boolean {
    return segment.isWalking() || segment.isWheelchair();
}

export function prevWaitingSegment(segment: Segment): Segment | undefined {
    const prevSegment = segment.prevSegment();
    return prevSegment && prevSegment.isStationay() ? prevSegment : undefined;
}