import genStyles from "../css/GenStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";
import { rowSelectedStyle, rowStyle } from "../service/TKUIServiceDepartureRow.css";

export const tKUIModeLocationRowDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,        
        ...rowStyle(theme),
        padding: '0 20px',
        borderBottom: '1px solid ' + black(4, theme.isDark),
        cursor: 'pointer'
    },
    selected: {
        ...rowSelectedStyle(theme)
    },
    transport: {
        width: '24px',
        height: '24px'
    },
    row: {
        ...genStyles.grow
    },
    distance: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        ...theme.textColorGray,
        ...theme.textSizeCaption,
        whiteSpace: 'nowrap',
        '& path': {
            fill: black(1, theme.isDark)
        }
    }
});