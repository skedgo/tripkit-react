import * as CSS from 'csstype';
import {CSSProps} from "../jss/StyleHelper";

interface ITKUIGenStyle {
    flex: CSS.Properties;
    column: CSS.Properties;
    alignSelfCenter: CSS.Properties;
    animateSpin: CSS.Properties;
    svgFillCurrColor: CSSProps<{}>;
}

const genStyles: ITKUIGenStyle = {

    flex: {
        ...{display: '-webkit-flex'},
        display: 'flex'
    },

    column: {
        flexDirection: 'column',
        WebkitFlexDirection: 'column'
    },

    alignSelfCenter: {
        alignSelf: 'center',
        WebkitAlignSelf: 'center'
    },

    animateSpin: {
        animation: 'spin 1.5s linear infinite'
    },

    svgFillCurrColor: {
        '& path': {
            fill: 'currentColor'
        },
        '& rect': {
            fill: 'currentColor'
        },
        '& circle': {
            fill: 'currentColor'
        }
    }

};

export default genStyles;