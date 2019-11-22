import {TKUIStyles} from "../../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../../jss/TKUITheme";
import genStyles from "../../css/GenStyle.css";
import {ITKUIWheelchairInfoProps, ITKUIWheelchairInfoStyle} from "./TKUIWheelchairInfo";

export const tKUIWheelchairInfoDefaultStyle: TKUIStyles<ITKUIWheelchairInfoStyle, ITKUIWheelchairInfoProps> =
    (theme: TKUITheme) => ({
        main: {
            color: tKUIColors.black1,
            ...genStyles.fontS,
            ...genStyles.flex,
            ...genStyles.alignCenter,
        },
        icon: {
            color: (props: ITKUIWheelchairInfoProps) => props.accessible === false ? theme.colorWarning : tKUIColors.black1,
            width: (props: ITKUIWheelchairInfoProps) => !props.brief ? '25px' : '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        },
        text: {
            ...genStyles.fontS,
            color: tKUIColors.black1,
            marginLeft: '5px'
        }
    });