import genStyles from "../css/GenStyle.css";
import { TKUITheme, black, white } from "../jss/TKUITheme";

export const tKUISubscriptionViewDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        minHeight: '100%',        
        background: '#d3d3d336'
    },
    banner: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        padding: '20px',
        marginBottom: '20px',
        background: black(theme.isDark ? 1 : 0, theme.isDark),
        color: white(0, theme.isDark),
        ...theme.textWeightBold
    },
    group: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    groupVertical: {
        ...genStyles.flex,
        ...genStyles.column,
        '& $value': {
            marginTop: '10px'
        }
    },
    label: {
        ...theme.textWeightSemibold
    },
    value: {

    },
    bundleMode: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '0!important'
    },
    disclaimer: {
        padding: '0 30px 20px'
    }
});
