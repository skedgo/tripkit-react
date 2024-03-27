import { black, TKUITheme } from "../../jss/TKUITheme";
import genStyles from "../../css/GenStyle.css";
import { ITKUIWheelchairInfoProps } from "./TKUIWheelchairInfo";

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
            width: (props: ITKUIWheelchairInfoProps) => '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        },
        text: {
            ...genStyles.fontS,
            ...theme.textColorGray,
            marginLeft: '10px'
        }
    });