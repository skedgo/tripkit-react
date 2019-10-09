import * as CSS from 'csstype';
import {CSSProps} from "../jss/StyleHelper";

interface ITKUIGenStyle {
    flex: CSS.Properties;
    column: CSS.Properties;
    center: CSS.Properties;
    spaceBetween: CSS.Properties;
    justifyEnd: CSS.Properties;
    alignCenter: CSS.Properties;
    alignSelfCenter: CSS.Properties;
    alignSelfStart: CSS.Properties;
    grow: CSS.Properties;
    noShrink: CSS.Properties;
    animateSpin: CSS.Properties;
    svgFillCurrColor: CSSProps<{}>;
    svgPathFillCurrColor: CSSProps<{}>;
    scrollableY: CSSProps<{}>;
    relative: CSSProps<{}>;

    fontL: CSSProps<{}>;
    fontM: CSSProps<{}>;
    fontS: CSSProps<{}>;
    fontSM: CSSProps<{}>;

    textGray: CSSProps<{}>;

    borderRadius: (radius: number, unit?: string) => CSSProps<{}>;
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

    justifyEnd: {
        justifyContent: 'flex-end',
        WebkitJustifyContent: 'flex-end'
    },

    alignCenter: {
        alignItems: 'center',
        WebkitAlignItems: 'center'
    },

    alignSelfCenter: {
        alignSelf: 'center',
        WebkitAlignSelf: 'center'
    },

    alignSelfStart: {
        alignSelf: 'flex-start',
        WebkitAlignSelf: 'flex-start'
    },

    grow: {
        flexGrow: 1,
        WebkitFlexGrow: 1
    },

    noShrink: {
        flexShrink: 0,
        WebkitFlexShrink: 0
    },

    relative: {
        position: 'relative'
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

    fontL: {
        fontSize: '20px',
        lineHeight: '28px'
    },

    fontM: {
        fontSize: '16px',
        lineHeight: '24px'
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
    })
};

export default genStyles;