import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIMxMIndexDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        margin: '10px 10px 5px'
    },
    track: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    transport: {
        margin: '0 5px',
        opacity: '.5',
        cursor: 'pointer'
    },
    selected: {
        opacity: '1'
    },
    tripTime: {
        ...theme.textColorGray,
        ...genStyles.flex,
        ...genStyles.center,
        marginTop: '5px'
    }
});