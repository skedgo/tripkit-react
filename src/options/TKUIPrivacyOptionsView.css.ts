import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIPrivacyOptionsViewProps, TKUIPrivacyOptionsViewStyle} from "./TKUIPrivacyOptionsView";
import genStyles from "../css/GenStyle.css";

export const tKUIPrivacyOptionsViewDefaultStyle: TKUIStyles<TKUIPrivacyOptionsViewStyle, TKUIPrivacyOptionsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            ...genStyles.fontM,
            padding: '15px 30px'
        },
        sectionBody: {
            padding: '0 30px',
            borderTop: '1px solid ' + tKUIColors.black4,
            ...theme.divider
        },
        sectionFooter: {
            ...genStyles.fontS,
            padding: '10px 15px'
        },
        optionRow: {
            ...genStyles.flex,
            padding: '15px 0',
            '&:not(:last-child)': {
                ...theme.divider
            }
        },
        optionTitle: {
            ...genStyles.fontM,
            fontWeight: 'bold',
            padding: '10px 0'
        },
        optionDescription: {
            ...genStyles.fontS
        },
        optionLink: {
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        checkboxRow: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            ...genStyles.alignStart
        }
    });