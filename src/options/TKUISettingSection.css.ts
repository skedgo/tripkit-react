import { TKUIStyles } from "../jss/StyleHelper";
import { TKUISettingSectionProps, TKUISettingSectionStyle } from "./TKUISettingSection";
import { black, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUISettingSectionDefaultStyle: TKUIStyles<TKUISettingSectionStyle, TKUISettingSectionProps> =
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
            borderTop: '1px solid ' + black(theme.isHighContrast ? 1 : 4, theme.isDark),
            ...genStyles.flex,
            ...genStyles.column,
            ...theme.divider,
            '&>*': {    // Style for option row
                padding: '15px 0',
                '&:not(:last-child)': {
                    ...theme.divider
                }
            }
        },
    });