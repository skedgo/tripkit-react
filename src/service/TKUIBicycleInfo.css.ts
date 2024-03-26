import { black, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { TKUIBicycleInfoProps } from "./TKUIBicycleInfo";

export const tKUIBicycleInfoDefaultStyle =
    (theme: TKUITheme) => ({
        main: {
            ...theme.textColorGray,
            ...genStyles.fontS,
            ...genStyles.flex,
            ...genStyles.alignCenter,
        },
        icon: {
            color: (props: TKUIBicycleInfoProps) => props.accessible === false ? theme.colorWarning : black(1, theme.isDark),
            width: (props: TKUIBicycleInfoProps) => !props.brief ? '25px' : '16px',
            height: '16px',
            ...genStyles.svgFillCurrColor
        },
        text: {
            ...genStyles.fontS,
            ...theme.textColorGray,
            marginLeft: '5px'
        }
    });