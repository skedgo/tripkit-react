import {TKUIStyles} from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";
import {TKUITripTimeProps, TKUITripTimeStyle} from "./TKUITripTime";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUITripTimeDefaultStyle: TKUIStyles<TKUITripTimeStyle, TKUITripTimeProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.spaceBetween
        },

        timePrimary: {
            ...genStyles.fontM,
            fontWeight: '600'
        },

        timeSecondary: {
            ...genStyles.fontM,
            ...theme.textColorGray
        }
    });