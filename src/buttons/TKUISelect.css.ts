import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUISelectProps, TKUISelectStyle} from "./TKUISelect";
import genStyles from "../css/GenStyle.css";

export const tKUISelectDefaultStyle: TKUIStyles<TKUISelectStyle, TKUISelectProps> =
    (theme: TKUITheme) => ({
        container: {
            ...genStyles.fontS
        },
        control: {
            border: 'none',
            background: 'none',
            boxShadow: 'none',
            cursor: 'pointer'
        },
        menu: {
            marginTop: '1px'
        },
        option: {
            color: tKUIColors.black1,
            cursor: 'pointer'
        },
        optionFocused: {
            backgroundColor: theme.colorPrimaryOpacity(.2)
        },
        optionSelected: {
            color: 'white',
            backgroundColor: theme.colorPrimaryOpacity(.5)
        }
    });