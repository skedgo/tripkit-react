import {CSSProps} from "../jss/StyleHelper";
import jss, {JSSPlugin} from 'jss';
import camelCase from 'jss-plugin-camel-case';
import genStyles from "./GenStyle.css";

jss.use(camelCase() as JSSPlugin);

interface ITKUIResetStyle {
    button: CSSProps<{}>;
    select: CSSProps<{}>;
    input: CSSProps<{}>;
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
        padding: 'initial'
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
        ...genStyles.borderRadius(0, '')
    }
};

export const resetClasses = jss.createStyleSheet(resetStyles,
    {
        classNamePrefix: 'reset-'
    }).attach().classes;