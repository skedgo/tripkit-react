import * as CSS from 'csstype';
import {CSSProps} from "../jss/StyleHelper";

interface ITKUIGenStyle {
    flex: CSS.Properties;
    column: CSS.Properties;
    center: CSS.Properties;
    spaceBetween: CSS.Properties;
    spaceAround: CSS.Properties;
    justifyStart: CSS.Properties;
    justifyEnd: CSS.Properties;
    alignCenter: CSS.Properties;
    alignStart: CSS.Properties;
    alignStretch: CSS.Properties;
    alignSelfCenter: CSS.Properties;
    alignSelfStart: CSS.Properties;
    alignSelfStretch: CSS.Properties;
    grow: CSS.Properties;
    noShrink: CSS.Properties;
    wrap: CSS.Properties;
    animateSpin: CSS.Properties;
    svgFillCurrColor: CSSProps<{}>;
    svgPathFillCurrColor: CSSProps<{}>;
    scrollableY: CSSProps<{}>;
    relative: CSSProps<{}>;
    hidden: CSSProps<{}>;
    rotate180: CSSProps<{}>;

    fontL: CSSProps<{}>;
    fontM: CSSProps<{}>;
    fontS: CSSProps<{}>;
    fontSM: CSSProps<{}>;

    fontMImp: CSSProps<{}>;

    textGray: CSSProps<{}>;

    borderRadius: (radius: number, unit?: string) => CSSProps<{}>;
    transformRotate: (angle: number, unit?: string) => CSSProps<{}>;
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

    center: {
        justifyContent: 'center',
        WebkitJustifyContent: 'center'
    },

    spaceBetween: {
        justifyContent: 'space-between',
        WebkitJustifyContent: 'space-between'
    },

    spaceAround: {
        justifyContent: 'space-around',
        WebkitJustifyContent: 'space-around'
    },

    justifyStart: {
        justifyContent: 'flex-start',
        WebkitJustifyContent: 'flex-start'
    },

    justifyEnd: {
        justifyContent: 'flex-end',
        WebkitJustifyContent: 'flex-end'
    },

    alignCenter: {
        alignItems: 'center',
        WebkitAlignItems: 'center'
    },

    alignStart: {
        alignItems: 'flex-start',
        WebkitAlignItems: 'flex-start'
    },

    alignStretch: {
        alignItems: 'stretch',
        WebkitAlignItems: 'stretch'
    },

    alignSelfCenter: {
        alignSelf: 'center',
        WebkitAlignSelf: 'center'
    },

    alignSelfStart: {
        alignSelf: 'flex-start',
        WebkitAlignSelf: 'flex-start'
    },

    alignSelfStretch: {
        alignSelf: 'stretch',
        WebkitAlignSelf: 'stretch'
    },

    grow: {
        flexGrow: 1,
        WebkitFlexGrow: 1
    },

    noShrink: {
        flexShrink: 0,
        WebkitFlexShrink: 0
    },

    wrap: {
        flexWrap: 'wrap',
        WebkitFlexWrap: 'wrap'
    },

    relative: {
        position: 'relative'
    },

    hidden: {
        visibility: 'hidden'
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
    },

    svgPathFillCurrColor: {
        '& path': {
            fill: 'currentColor'
        }
    },

    scrollableY: {
        overflowY: 'auto'
    },

    rotate180: {
        WebkitTransform: 'rotate(180deg)',
        MozTransform: 'rotate(180deg)',
        OTransform: 'rotate(180deg)',
        transform: 'rotate(180deg)'
    },

    fontL: {
        fontSize: '20px',
        lineHeight: '28px'
    },

    fontM: {
        fontSize: '16px',
        lineHeight: '24px'
    },

    fontMImp: {
        fontSize: '16px!important',
        lineHeight: '24px!important'
    },

    fontS: {
        fontSize: '14px',
        lineHeight: '20px'
    },

    fontSM: {
        fontSize: '12px',
        lineHeight: '16px'
    },

    textGray: {
        color: '#212a3399'
    },

    borderRadius: (radius: number, unit: string = 'px') => ({
        borderRadius: radius + unit,
        WebkitBorderRadius: radius + unit,
        MozBorderRadius: radius + unit
    }),

    transformRotate: (angle: number, unit: string = 'deg') => ({
        WebkitTransform: 'rotate(' + angle + unit + ')',
        MsTransform: 'rotate(' + angle + unit + ')',
        MozTransform: 'rotate(' + angle + unit + ')',
        transform: 'rotate(' + angle + unit + ')'
    })
};

export default genStyles;