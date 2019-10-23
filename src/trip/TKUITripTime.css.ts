import {TKUIStyles} from "../jss/StyleHelper";
import {ITKUITripTimeProps, ITKUITripTimeStyle} from "./TKUITripTime";
import genStyles from "../css/GenStyle.css";

export const tKUITripTimeDefaultStyle: TKUIStyles<ITKUITripTimeStyle, ITKUITripTimeProps> = {
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