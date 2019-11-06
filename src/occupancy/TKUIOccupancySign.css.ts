import {TKUIStyles} from "../jss/StyleHelper";
import {ITKUIOccupancySignProps, ITKUIOccupancySignStyle} from "./TKUIOccupancySign";
import {tKUIColors, TKUITheme} from "../jss/TKStyleProvider";
import genStyles from "../css/GenStyle.css";

export const tKUIOccupancySignDefaultStyle: TKUIStyles<ITKUIOccupancySignStyle, ITKUIOccupancySignProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        passengers: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        passengerSlot: {
            height: '20px',
            width: 'auto',
            opacity: .2
        },
        passenger: {
            opacity: .6
        },
        text: {
            ...genStyles.fontS,
            color: tKUIColors.black1,
            marginLeft: '5px'
        }
    });