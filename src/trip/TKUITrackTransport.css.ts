import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUITrackTransportProps, TKUITrackTransportStyle} from "./TKUITrackTransport";
import genStyles from "../css/GenStyle.css";

export const tKUITrackTransportDefaultStyle: TKUIStyles<TKUITrackTransportStyle, TKUITrackTransportProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        icon: {
            width: '24px',
            height: '24px',
            marginRight: '3px'
        },
        info: {
            fontSize: '13px',
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignStart,
            padding: (props: TKUITrackTransportProps) => props.brief === false ? '0 5px' : undefined
        },
        subtitle: {
            color: tKUIColors.black1
        }
    });