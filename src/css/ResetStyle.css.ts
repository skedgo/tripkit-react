import {CSSProps} from "../jss/StyleHelper";
import jss, {JSSPlugin} from 'jss';
import camelCase from 'jss-plugin-camel-case';

jss.use(camelCase() as JSSPlugin);

interface ITKUIResetStyle {
    button: CSSProps<{}>;
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
        border: 'none'
    }
};

export const resetClasses = jss.createStyleSheet(resetStyles,
    {
        classNamePrefix: 'reset-'
    }).attach().classes;