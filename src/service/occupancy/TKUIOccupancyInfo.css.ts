import {TKUIStyles} from "../../jss/StyleHelper";
import {ITKUIOccupancyInfoProps, ITKUIOccupancyInfoStyle} from "./TKUIOccupancyInfo";
import {tKUIColors, TKUITheme} from "../../jss/TKUITheme";
import genStyles from "../../css/GenStyle.css";

export const tKUIOccupancyInfoDefaultStyle: TKUIStyles<ITKUIOccupancyInfoStyle, ITKUIOccupancyInfoProps> =
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