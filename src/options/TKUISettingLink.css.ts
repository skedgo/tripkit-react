import {TKUIStyles} from "../jss/StyleHelper";
import {TKUISettingLinkProps, TKUISettingLinkStyle} from "./TKUISettingLink";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUISettingLinkDefaultStyle: TKUIStyles<TKUISettingLinkStyle, TKUISettingLinkProps> =
    (theme: TKUITheme) => ({
        optionLink: {
            ...resetStyles.button,
            // Row styles
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.fontM,
            padding: '15px 0',
            '&:not(:last-child)': {
                ...theme.divider
            },
            ...genStyles.spaceBetween,
            cursor: 'pointer',
            '& svg': {
                ...genStyles.svgFillCurrColor,
                color: theme.colorPrimary
            }
        },
    });