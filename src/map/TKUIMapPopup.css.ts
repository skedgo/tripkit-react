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
            padding: '1px'
        },
        button: {
            ...resetStyles.button,
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary
        },
        rightPanel: {
            ...genStyles.flex,
            ...genStyles.column
        },
        separator: {
            marginRight: '10px',
            borderRight: '1px solid ' + theme.colorPrimary,
            paddingRight: '10px',
            ...genStyles.alignSelfStretch
        },
        title: {
            ...genStyles.fontS
        },
        subtitle: {
            ...genStyles.fontSM
        }
    });