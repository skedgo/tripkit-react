import {TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIMapPopupProps, TKUIMapPopupStyle} from "./TKUIMapPopup";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIMapPopupStyle: TKUIStyles<TKUIMapPopupStyle, TKUIMapPopupProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '5px 10px',
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.fontS
        },
        icon: {
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary
        },
        button: {
            ...resetStyles.button,
            marginRight: '10px',
            borderRight: '1px solid #23b15e',
            paddingRight: '10px'
        },
        rightPanel: {
            ...genStyles.flex,
            ...genStyles.column
        },
        title: {
            ...genStyles.fontS
        },
        subtitle: {
            ...genStyles.fontSM
        }
    });