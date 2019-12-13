import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIUserPrioritiesProps, TKUIUserPrioritiesStyle} from "./TKUIUserPriorities";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIUserPrioritiesDefaultStyle: TKUIStyles<TKUIUserPrioritiesStyle, TKUIUserPrioritiesProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            '&>*': {
                marginBottom: '15px'
            },
            color: theme.colorPrimary
        }
    });