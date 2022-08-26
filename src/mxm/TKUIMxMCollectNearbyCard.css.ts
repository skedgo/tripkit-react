import genStyles from "../css/GenStyle.css";
import { TKUITheme, white } from "../jss/TKUITheme";

export const tKUIMxMCollectNearbyCardDefaultStyle = (theme: TKUITheme) => ({
    filter: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.secondaryBackground,
        margin: '0 -16px',
        padding: '8px'
    },
    toggle: {
        ...genStyles.borderRadius(20),                
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '6px 10px',
        background: white(1, theme.isDark),
        '&:not(:first-child)': {
            marginLeft: '10px'
        },
        cursor: 'pointer'
    },
    disabled: {
        opacity: '.5'
    },
    icon: {
        width: '24px!important',
        height: '24px',
        '&:not(:first-child)': {
            marginLeft: '15px'
        }
    }
});