import genStyles from "../css/GenStyle.css";
import { TKUITheme } from "../jss/TKUITheme";

export const tKUIProviderTicketsFormDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        ...genStyles.spaceBetween,
        padding: '32px 16px 16px 16px'
    },
    divider: {
        ...theme.divider,
        marginTop: 'auto'
    },
    footer: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        padding: '20px',
        '& button': {
            ...genStyles.grow,
            marginLeft: '20%'
        }
    },
    fareSummary: {
        ...genStyles.flex,
        ...genStyles.fontL,
        '&>*': {
            marginRight: '10px',
            whiteSpace: 'nowrap'
        }
    }
});
