import jss from 'jss';
import genStyles from "./GenStyle.css";
import DeviceUtil from "../util/DeviceUtil";

interface ITKUIResetStyle {
    // button: CSSProps<{}>;
    button: any;
    select: any;
    input: any;
}

export const resetStyles: ITKUIResetStyle = {
    button: {
        background: 'initial',
        fontSize: '14px',
        color: 'unset',
        textTransform: 'initial',
        textAlign: 'center',
        lineHeight: 'initial',
        fontFamily: 'unset',
        letterSpacing: 'initial',
        textDecoration: 'initial',
        WebkitAppearance: 'initial',
        MozAppearance: 'initial',
        appearance: 'initial',
        cursor: 'pointer',
        border: 'none',
        padding: 'initial',
        ...DeviceUtil.isIE && {
            background: 'none',  // 'initial' value is not supported by IE
            padding: '0'
        }
    },
    select: {
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        MsAppearance: 'none',
        OAppearance: 'none',
        background: 'none!important',
        border: 'none!important',
        WebkitBoxShadow: 'none!important',
        MozBoxShadow: 'none!important',
        boxShadow: 'none!important',
        borderRadius: 'initial',
        WebkitBorderRadius: 'initial',
        MozBorderRadius: 'initial',
        margin: 'initial'
    },
    input: {
        border: 'none',
        background: 'initial',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        MsAppearance: 'none',
        OAppearance: 'none',
        WebkitBoxShadow: 'none!important',
        MozBoxShadow: 'none!important',
        boxShadow: 'none!important',
        margin: 'initial',
        height: 'initial',
        lineHeight: 'normal',
        ...genStyles.borderRadius(0, ''),
        ...DeviceUtil.isIE && {
            background: 'none'  // 'initial' value is not supported by IE
        }
    }
};

// TODO: neede to add as any to avoid type error.
export const resetClasses = jss.createStyleSheet(resetStyles as any,
    {
        classNamePrefix: 'reset-'
    }).attach().classes;