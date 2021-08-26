import {TKUIStyles} from "../jss/StyleHelper";
import {colorWithOpacity, TKUITheme, white} from "../jss/TKUITheme";
import {TKUISelectProps, TKUISelectStyle} from "./TKUISelect";
import genStyles from "../css/GenStyle.css";
import DeviceUtil from "../util/DeviceUtil";

export const tKUISelectDefaultStyle: TKUIStyles<TKUISelectStyle, TKUISelectProps> =
    (theme: TKUITheme) => ({
        main: {
            '& input': {    // Make input visible so it's highlighted on focus for accessibility.
                left: '0',
                transform: 'none',
                ...genStyles.grow,
                opacity: '1',
                cursor: 'pointer'
            }
        },
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
        placeholder: {},
        valueContainer: {},
        menu: {
            marginTop: '1px',
            background: white(0, theme.isDark),
            boxShadow: theme.isLight ?
                '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
                '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)'
        },
        option: {
            ...DeviceUtil.isPhone ? genStyles.fontM : theme.textSizeCaption,
            ...theme.textWeightSemibold,
            ...theme.textColorGray,
            cursor: 'pointer',
            '&:active': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .4)
            }
        },
        optionFocused: {
            backgroundColor: colorWithOpacity(theme.colorPrimary, .2)
        },
        optionSelected: {
            color: 'white',
            backgroundColor: colorWithOpacity(theme.colorPrimary, .5)
        },
        singleValue: {
            ...DeviceUtil.isPhone ? genStyles.fontM : theme.textSizeCaption
        },
        multiValue: {
            ...DeviceUtil.isPhone ? genStyles.fontM : theme.textSizeCaption
        }
    });