import {TKUIStyles} from "../../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../../jss/TKStyleProvider";
import genStyles from "../../css/GenStyle.css";
import {ITKUIWheelchairInfoProps, ITKUIWheelchairInfoStyle} from "./TKUIWheelchairInfo";

export const tKUIWheelchairInfoDefaultStyle: TKUIStyles<ITKUIWheelchairInfoStyle, ITKUIWheelchairInfoProps> =
    (theme: TKUITheme) => ({
        main: {
            color: tKUIColors.black1,
            ...genStyles.fontS,
            ...genStyles.flex,
            ...genStyles.alignCenter,
            '& svg': {
                margin: '0 15px 0 10px'
            }
        },
        icon: {
            color: tKUIColors.black1,
            width: '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        }
    });