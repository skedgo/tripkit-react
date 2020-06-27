import {TKUIStyles} from "../jss/StyleHelper";
import {colorWithOpacity, TKUITheme, white} from "../jss/TKUITheme";
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
            marginTop: '1px',
            background: white(0, theme.isDark),
            boxShadow: theme.isLight ?
                '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
                '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)'
        },
        option: {
            ...theme.textSizeCaption,
            ...theme.textWeightSemibold,
            ...theme.textColorGray,
            cursor: 'pointer'
        },
        optionFocused: {
            backgroundColor: colorWithOpacity(theme.colorPrimary, .2)
        },
        optionSelected: {
            color: 'white',
            backgroundColor: colorWithOpacity(theme.colorPrimary, .5)
        }
    });