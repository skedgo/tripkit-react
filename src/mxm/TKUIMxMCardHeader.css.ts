import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";
import { isRemoteIcon } from "../map/TKUIMapLocationIcon.css";

export const tKUIMxMCardHeaderJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '&>*:last-child': {
            ...genStyles.grow
        }
    },
    transIconCircled: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,        
        border: '2px solid lightgray!important',
        borderRadius: '50%',        
        marginLeft: '16px',
        marginRight: '0',
        width: '44px!important',  // To reserve space while loading image.
        height: '44px',
        background: props => props.segment.modeInfo && isRemoteIcon(props.segment.modeInfo) ? 'white' : 'none',
        '& img': {
            width: '24px',
            height: '24px'
        }
    }
});
