import {TKUITheme} from "../index";
import genStyles from "../css/GenStyle.css";
import {tKUIMxMBookingCardDefaultStyle} from "../mxm/TKUIMxMBookingCard.css";

export const tKUIActiveTripDefaultStyle = (theme: TKUITheme) => {
    const {value, label, circle, divider, groupRight, fromToTrack, line} = tKUIMxMBookingCardDefaultStyle(theme);
    return ({
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
        },
        group: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        value,
        label,
        circle,
        divider,
        groupRight,
        fromToTrack,
        line
    });
};
