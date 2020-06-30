import {TKUIStyles} from "../jss/StyleHelper";
import {black, TKUITheme} from "../jss/TKUITheme";
import {TKUIErrorViewProps, TKUIErrorViewStyle} from "./TKUIErrorView";
import genStyles from "../css/GenStyle.css";

export const tKUIErrorViewDefaultStyle: TKUIStyles<TKUIErrorViewStyle, TKUIErrorViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignCenter,
            padding: '40px 16px'
        },
        imgConstruction: {
            width: '200px',
            height: '200px'
        },
        message: {
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter,
            margin: '24px 0',
            ...genStyles.fontM,
            color: black(2, theme.isDark),
            textAlign: 'center'
        },
        errorActions: {
            width: '250px',
            ...genStyles.flex,
            ...genStyles.column,
            '&>*:not(:first-child)': {
                marginTop: '8px'
            }
        }
    });