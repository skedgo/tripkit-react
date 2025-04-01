import { tKUIColors, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIPrivacyOptionsViewDefaultStyle = (theme: TKUITheme) => ({
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
        padding: '10px 15px',
        margin: '-20px 0 20px'
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
        padding: '15px',
        flexGrow: 1
    },
    checkboxRow: {
        ...genStyles.flex,
        ...genStyles.spaceBetween,
        ...genStyles.alignStart
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        position: 'absolute',
        top: '0',
        backgroundColor: '#ffffffbf',
        height: '100%',
        width: '100%',
        zIndex: 5
    }
});