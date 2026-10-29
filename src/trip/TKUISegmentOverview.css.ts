import { black, TKUITheme } from "../jss/TKUITheme";
import { TKUISegmentOverviewProps } from "./TKUISegmentOverview";
import genStyles from "../css/GenStyle.css";
import Segment from "../model/trip/Segment";

function lineColorForSegment(segment?: Segment) {
    return (!segment || segment.arrival || isUnconnected(segment)) ?
        undefined : segment.getColor();
}

export const tKUISegmentOverviewDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        cursor: props => props.onClick ? 'pointer' : undefined
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
            if (prevSegment && prevSegment.isStationary()) {
                // Skip stationary segment, though it should never be the case since header of a segment with a
                // stationary prev segment is not displayed.
                prevSegment = prevSegment.prevSegment();
            }
            const color = lineColorForSegment(prevSegment);
            return color && '4px solid ' + color;
        },
        ...genStyles.grow
    },
    longLine: {
        height: '35px',
        flexGrow: '0!important'
    },
    line: { // Line with the color of the current segment.
        borderLeft: (props: TKUISegmentOverviewProps) => {
            const color = lineColorForSegment(props.value);
            return color && '4px solid ' + color;
        },
        ...genStyles.grow
    },
    nextLine: { // Line with the color of the next segment. This style is just used for stationary segments.
        borderLeft: (props: TKUISegmentOverviewProps) => {
            const color = lineColorForSegment(props.value.nextSegment());
            return color && '4px solid ' + color;
        },
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
            if (prevSegment && prevSegment.isStationary()) {
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
        opacity: theme.isHighContrast ? '.8' : '.4',
        width: '24px',
        height: '24px',
        '& path': {
            fill: black(0, theme.isDark)
        }
    },
    icon: {
        opacity: theme.isHighContrast ? '.8' : '.4',
        width: '24px!important',
        height: '24px'
    },
    iconCircledColor: {
        background: (props: TKUISegmentOverviewProps) => props.value.getColor(),
        padding: '3px',
        width: '24px!important',
        height: '24px',
        ...genStyles.borderRadius(50, '%'),
        '& img': {
            width: '18px!important',
            height: '18px',
        }
    },
    iconCircledWhite: {
        background: 'white',
        padding: '2px',
        width: '28px',
        height: '28px',
        ...genStyles.borderRadius(50, '%'),
        '& img': {
            width: '24px!important',
            height: '24px',
        }
    },
    description: {
        padding: '10px 0',
        marginRight: '16px',
        borderTop: '1px solid ' + black(theme.isHighContrast ? 1 : 4, theme.isDark),
        borderBottom: '1px solid ' + black(theme.isHighContrast ? 1 : 4, theme.isDark),
        ...genStyles.grow,
    },
    action: {
        fontWeight: '600',
        ...genStyles.fontM,
    },
    notes: {
        ...genStyles.fontS,
        color: black(theme.isHighContrast ? 0 : 1, theme.isDark)
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
        && !segment.isWalking() && !segment.isWheelchair() && !segment.isStationary();
}

export function isUnconnected(segment: Segment): boolean {
    return segment.isWalking() || segment.isWheelchair();
}

export function prevWaitingSegment(segment: Segment): Segment | undefined {
    const prevSegment = segment.prevSegment();
    return prevSegment && prevSegment.isStationary() ? prevSegment : undefined;
}