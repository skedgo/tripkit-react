import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITheme} from "../jss/TKUITheme";
import {TKUIReportBtnProps, TKUIReportBtnStyle} from "./TKUIReportBtn";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIReportBtnDefaultStyle: TKUIStyles<TKUIReportBtnStyle, TKUIReportBtnProps> =
    (theme: TKUITheme) => ({
        main: {
            ...resetStyles.button
        }
    });