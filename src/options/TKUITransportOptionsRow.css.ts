import {TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITransportOptionsRowProps, TKUITransportOptionsRowStyle} from "./TKUITransportOptionsRow";
import genStyles from "../css/GenStyle.css";

export const tKUITransportOptionsRowStyle: TKUIStyles<TKUITransportOptionsRowStyle, TKUITransportOptionsRowProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '15px',
            ...genStyles.flex,

        },
        iconExpand: {
            width: '20px',
            height: '20px',
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary
        }
    });