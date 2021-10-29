import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIMxMCardHeaderJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '&>*:last-child': {
            ...genStyles.grow
        }
    },
    transIcon: {
        border: '2px solid lightgray!important',
        borderRadius: '50%',
        padding: '5px',
        marginLeft: '16px',
        marginRight: '0',
        width: '38px!important',  // To reserve space while loading image.
        height: '38px'
    }
});
