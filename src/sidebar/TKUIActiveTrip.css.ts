import {colorWithOpacity, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIActiveTripDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column
    },
    activeTripHeader: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    activeTripTitle: {
        ...theme.textColorGray
    },
    info: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    icon: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.borderRadius(50, '%'),
        padding: '7px',
        background: colorWithOpacity(theme.colorPrimary, .1),
        '& svg': {
            width: '18px',
            height: '18px'
        },
        '& svg path': {
            fill: theme.colorPrimary
        }
    },
    contentInfo: {
        marginTop: '20px',
        cursor: 'pointer'
    },
    timeStatus: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        marginBottom: '16px'
    },
    startTime: {
        ...theme.textWeightBold
    }
});
