import {TKUIStyles} from "../jss/StyleHelper";
import {TKUISettingLinkProps, TKUISettingLinkStyle} from "./TKUISettingLink";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUISettingLinkDefaultStyle: TKUIStyles<TKUISettingLinkStyle, TKUISettingLinkProps> =
    (theme: TKUITheme) => ({
        optionRow: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            padding: '15px 0',
            '&:not(:last-child)': {
                ...theme.divider
            }
        },
        optionLink: {
            ...genStyles.spaceBetween,
            cursor: 'pointer',
            '& svg': {
                ...genStyles.svgFillCurrColor,
                color: theme.colorPrimary
            }
        },
    });