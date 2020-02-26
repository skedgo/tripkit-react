import {TKUIStyles} from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";
import {TKUITripTimeProps, TKUITripTimeStyle} from "./TKUITripTime";

export const tKUITripTimeDefaultStyle: TKUIStyles<TKUITripTimeStyle, TKUITripTimeProps> = {
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
        ...genStyles.textGray
    }
};