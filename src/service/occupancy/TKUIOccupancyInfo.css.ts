import {TKUIStyles} from "../../jss/StyleHelper";
import {ITKUIOccupancyInfoProps, ITKUIOccupancyInfoStyle} from "./TKUIOccupancyInfo";
import {black, TKUITheme} from "../../jss/TKUITheme";
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
            height: '16px',
            width: 'auto',
            marginRight: '2px',
            opacity: .2,
            '& path': {
                fill: black(0, theme.isDark)
            }
        },
        passenger: {
            opacity: .6
        },
        text: {
            ...genStyles.fontS,
            color: black(1, theme.isDark),
            marginLeft: '5px'
        }
    });