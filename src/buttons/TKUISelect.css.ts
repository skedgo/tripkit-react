import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUISelectProps, TKUISelectStyle} from "./TKUISelect";
import genStyles from "../css/GenStyle.css";
import DeviceUtil from "../util/DeviceUtil";

export const tKUISelectDefaultStyle: TKUIStyles<TKUISelectStyle, TKUISelectProps> =
    (theme: TKUITheme) => ({
        container: {
            ...genStyles.fontS
        },
        control: {
            border: 'none',
            background: 'none',
            boxShadow: 'none',
            cursor: 'pointer',
            ...DeviceUtil.isIE && {
                minHeight: 0
            }
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