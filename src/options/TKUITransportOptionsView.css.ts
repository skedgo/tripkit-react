import {black, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITransportOptionsViewProps, TKUITransportOptionsViewStyle} from "./TKUITransportOptionsView";
import genStyles from "../css/GenStyle.css";

export const tKUITransportOptionsViewDefaultStyle: TKUIStyles<TKUITransportOptionsViewStyle, TKUITransportOptionsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column
        },
        loadingPanel: {
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter,
            height: '100%'
        },
        iconLoading: {
            margin: '0 5px',
            width: '20px',
            height: '20px',
            color: black(1, theme.isDark),
            ...genStyles.animateSpin,
            ...genStyles.svgFillCurrColor
        }
    });