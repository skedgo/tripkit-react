import {TKUIStyles} from "../jss/StyleHelper";
import {black, TKUITheme} from "../jss/TKUITheme";
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
            ...theme.textWeightSemibold,
            ...genStyles.fontM,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center,
            ...genStyles.grow,
            margin: '10px 0'
        },
        subtitle: {
            ...genStyles.fontS,
            color: black(1, theme.isDark),
            fontWeight: 'normal'
        },
        time: {
            ...theme.textSizeCaption,
            ...theme.textColorGray,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center,
            margin: '0 16px'
        },
        timeBottom: {
            ...theme.textSizeCaption,
            ...theme.textColorGray,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center,
            margin: 'auto 16px 10px 16px'
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
        preLine: {  // Line with the color of the previous segment.
            borderLeft: (props: TKUISegmentOverviewProps) => {
                let prevSegment = props.value.prevSegment();
                if (prevSegment && prevSegment.isStationay()) {
                    // Skip stationary segment, though it should never be the case since header of a segment with a
                    // stationary prev segment is not displayed.
                    prevSegment = prevSegment.prevSegment();
                }
                return !prevSegment || isUnconnected(prevSegment) ? undefined :
                    '4px solid ' + prevSegment.getColor();
            },
            ...genStyles.grow
        },
        longLine: {
            height: '35px',
            flexGrow: '0!important'
        },
        line: { // Line with the color of the current segment.
            borderLeft: (props: TKUISegmentOverviewProps) => (props.value.arrival || isUnconnected(props.value)) ?
                undefined : '4px solid ' + props.value.getColor(),
            ...genStyles.grow
        },
        nextLine: { // Line with the color of the next segment. This style is just used for stationary segments.
            borderLeft: (props: TKUISegmentOverviewProps) => props.value.nextSegment() &&
                '4px solid ' + props.value.nextSegment()!.getColor(),
            ...genStyles.grow
        },
        prevCircle: {
            width: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            height: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            border: (props: TKUISegmentOverviewProps) => {  // Circle with the color of the previous segment.
                const segment = props.value;
                let prevSegment = segment.prevSegment();
                // Skip stationary segment, though it should never be the case since header of a segment with a
                // stationary prev segment is not displayed.
                if (prevSegment && prevSegment.isStationay()) {
                    prevSegment = prevSegment.prevSegment();
                }
                return prevSegment ? '4px solid ' + prevSegment.getColor() : 'none';
            },
            ...genStyles.borderRadius(50, "%")
        },
        circle: {   // Circle with the color of the current segment.
            width: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            height: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            border: (props: TKUISegmentOverviewProps) => '4px solid ' + props.value.getColor(),
            ...genStyles.borderRadius(50, "%")
        },
        nextCircle: {   // Circle with the color of the next segment. This style is just used for stationary segments.
            width: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            height: (props: TKUISegmentOverviewProps) => props.value.isContinuation ? '14px' : '16px',
            border: (props: TKUISegmentOverviewProps) => {
                const segment = props.value;
                let nextSegment = segment.nextSegment();
                return nextSegment ? '4px solid ' + nextSegment.getColor() : 'none';
            },
            ...genStyles.borderRadius(50, "%")
        },
        iconPin: {
            opacity: '.4',
            width: '24px',
            height: '24px',
            '& path': {
                fill: black(0, theme.isDark)
            }
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
                return isIconOnDark(props.value) || modeInfo.remoteIcon ? '1' : '.4';
            },
            width: '24px!important',
            height: '24px',
            ...genStyles.borderRadius(50, '%')
        },
        description: {
            padding: '10px 0',
            marginRight: '16px',
            borderTop: '1px solid ' + black(4, theme.isDark),
            borderBottom: '1px solid ' + black(4, theme.isDark),
            ...genStyles.grow,
        },
        action: {
            fontWeight: '600',
            ...genStyles.fontM,
        },
        notes: {
            ...genStyles.fontS,
            color: black(1, theme.isDark)
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
        },
        separation: {
            marginBottom: '5px'
        },
        circleSeparation: {
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