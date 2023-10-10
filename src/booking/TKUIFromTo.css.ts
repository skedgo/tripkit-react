import genStyles from "../css/GenStyle.css";
import { tKUIMxMBookingCardDefaultStyle } from "../mxm/TKUIMxMBookingCard.css";
import { TKUITheme } from "../jss/TKUITheme";

export const tKUIFromToDefaultStyle = (theme: TKUITheme) => {
    const { value, label } = tKUIMxMBookingCardDefaultStyle(theme);
    return ({
        groupRight: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.spaceBetween,
            ...genStyles.grow
        },
        fromToTrack: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignCenter,
            ...genStyles.alignSelfStretch,
            marginRight: '16px',
            padding: '2px 4px 2px'
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
        group: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        value: {
            ...value,
            '&:first-child': {
                marginTop: '15px'
            }
        },
        label: {
            ...label,
            ...theme.textColorDefault,
            ...theme.textWeightSemibold,
            '&:not(:first-child)': {
                marginTop: '15px'
            }
        }
    });
};
