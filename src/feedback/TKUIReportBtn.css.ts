import {TKUIStyles} from "../jss/StyleHelper";
import {colorWithOpacity, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIReportBtnProps, TKUIReportBtnStyle} from "./TKUIReportBtn";
import {resetStyles} from "../css/ResetStyle.css";
import genStyles from "../css/GenStyle.css";

export const tKUIReportBtnDefaultStyle: TKUIStyles<TKUIReportBtnStyle, TKUIReportBtnProps> =
    (theme: TKUITheme) => ({
        main: {
            ...resetStyles.button
        },
        actionMenu: {
            background: 'white',
            padding: '5px'
        },
        actionItem: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            padding: '5px',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .08)
            }
        },
        actionIcon: {
            width: '24px',
            height: '24px',
            ...genStyles.svgFillCurrColor,
            color: tKUIColors.black1,
            marginRight: '10px'
        }
    });