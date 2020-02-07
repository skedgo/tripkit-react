import {TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITransportOptionsViewProps, TKUITransportOptionsViewStyle} from "./TKUITransportOptionsView";
import genStyles from "../css/GenStyle.css";

export const tKUITransportOptionsViewDefaultStyle: TKUIStyles<TKUITransportOptionsViewStyle, TKUITransportOptionsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column
        }
    });