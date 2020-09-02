import {TKUIStyles} from "../../../jss/StyleHelper";
import {TGUIDevSettingsProps, TGUIDevSettingsStyle} from "./TGUIDevSettings";
import {black, TKUITheme} from "../../../jss/TKUITheme";
import genStyles from "../../../css/GenStyle.css";

export const tGUIDevSettingsDefaultStyle: TKUIStyles<TGUIDevSettingsStyle, TGUIDevSettingsProps> =
    (theme: TKUITheme) => ({
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            ...genStyles.fontM,
            padding: '15px 30px'
        },
        sectionBody: {
            padding: '0 30px',
            borderTop: '1px solid ' + black(4, theme.isDark),
            ...theme.divider
        },
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
        }
    });