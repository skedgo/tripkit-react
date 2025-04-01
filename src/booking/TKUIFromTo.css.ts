import genStyles from "../css/GenStyle.css";
import { TKUITheme } from "../jss/TKUITheme";

export const tKUIFromToDefaultStyle = (theme: TKUITheme) => ({
    main: {
        display: 'grid',
        gridTemplateColumns: '20px auto',
        rowGap: '10px',
        columnGap: '15px'
    },
    fromToTrack: {
        gridArea: '1 / 1 / 5 / 1',
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        ...genStyles.alignSelfStretch,
        padding: '5px 0'
    },
    circle: {
        border: '3px solid ' + theme.colorPrimary,
        ...genStyles.borderRadius(50, '%'),
        width: '13px',
        height: '13px'
    },
    line: {
        ...genStyles.grow,
        borderLeft: '1px solid ' + theme.colorPrimary
    },
    pickupLabel: {
        gridColumnStart: '2',
        ...theme.textSizeCaption,
        ...theme.textColorGray,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.textColorDefault,
        ...theme.textWeightSemibold
    },
    pickupTime: {
        gridColumnStart: '2'
    },
    pickupAddress: {
        gridColumnStart: '2'
    },
    dropoffLabel: {
        gridColumnStart: '2',
        ...theme.textSizeCaption,
        ...theme.textColorGray,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.textColorDefault,
        ...theme.textWeightSemibold,
        marginTop: '15px'
    },
    dropoffTime: {
        gridColumnStart: '2'
    },
    dropoffAddress: {
        gridColumnStart: '2'
    }
});
