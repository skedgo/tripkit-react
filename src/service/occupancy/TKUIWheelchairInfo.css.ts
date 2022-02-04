import {TKUIStyles} from "../../jss/StyleHelper";
import {black, tKUIColors, TKUITheme} from "../../jss/TKUITheme";
import genStyles from "../../css/GenStyle.css";
import {ITKUIWheelchairInfoProps, ITKUIWheelchairInfoStyle} from "./TKUIWheelchairInfo";

export const tKUIWheelchairInfoDefaultStyle =
    (theme: TKUITheme) => ({
        main: {
            ...theme.textColorGray,
            ...genStyles.fontS,
            ...genStyles.flex,
            ...genStyles.alignCenter,
        },
        icon: {
            color: (props: ITKUIWheelchairInfoProps) => props.accessible === false ? theme.colorWarning : black(1, theme.isDark),
            width: (props: ITKUIWheelchairInfoProps) => !props.brief ? '25px' : '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        },
        text: {
            ...genStyles.fontS,
            ...theme.textColorGray,
            marginLeft: '5px'
        }
    });