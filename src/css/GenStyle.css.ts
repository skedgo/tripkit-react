import * as CSS from 'csstype';
import {CSSProps} from "../jss/StyleHelper";
// TODO: switch to react-jss v10 that provides createUseStyles. Fix issue with hooks first, since v10 uses hooks. Allow
// to get rid of @types/react-jss
// import {createUseStyles} from 'react-jss';
import jss from 'jss';
import camelCase from 'jss-plugin-camel-case';
import nested from 'jss-nested';
import global from 'jss-plugin-global';

jss.use(camelCase(), nested(), global());

interface ITKUIGenStyleClasses {
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
    overflowEllipsis: CSSProps<{}>;

    fontL: CSSProps<{}>;
    fontM: CSSProps<{}>;
    fontS: CSSProps<{}>;
    fontSM: CSSProps<{}>;

    fontMImp: CSSProps<{}>;

    textGray: CSSProps<{}>;

    link: CSSProps<{}>;

    root: CSSProps<{}>;

    focusTarget: CSSProps<{}>;

    userIsTabbing: CSSProps<{}>;
}

interface ITKUIGenStyleCreators {
    borderRadius: (radius: number, unit?: string) => CSSProps<{}>;
    transformRotate: (angle: number, unit?: string) => CSSProps<{}>;
}

interface ITKUIGenStyle extends ITKUIGenStyleClasses, ITKUIGenStyleCreators {}

// TODO: confirm automatic vendor prefixing works. See: https://cssinjs.org/jss-plugin-vendor-prefixer/?v=v10.1.1.
// See if need to import it, probably yes:
const keyframesStyle = {
    // '@-ms-keyframes spin': {
    //     from: {
    //         '-ms-transform': 'rotate(0deg)'
    //     },
    //     to: {
    //         '-ms-transform': 'rotate(360deg)'
    //     }
    // },
    // '@-moz-keyframes spin': {
    //     from: {
    //         '-moz-transform': 'rotate(0deg)'
    //     }, to: {
    //         '-moz-transform': 'rotate(360deg)'
    //     }
    // },
    // '@-webkit-keyframes spin': {
    //     from: {
    //         '-webkit-transform': 'rotate(0deg)'
    //     },
    //     to: {
    //         '-webkit-transform': 'rotate(360deg)'
    //     }
    // },
    '@keyframes spin': {
        from: {
            transform: 'rotate(0deg)'
        },
        to: {
            transform: 'rotate(360deg)'
        }
    },
    // See doc: https://cssinjs.org/jss-syntax/?v=v10.1.1#font-face
    // '@font-face': [
    //     {
    //         fontFamily: 'ProximaNova',
    //         src: "url('/fonts/269860_3_0.eot'), url('/fonts/269860_3_0.eot?#iefix') format('embedded-opentype'), url('/fonts/269860_3_0.eot?#iefix') format('embedded-opentype'), url('/fonts/269860_3_0.woff') format('woff'), url('/fonts/269860_3_0.ttf') format('truetype')"
    //     },
    //     {
    //         fontFamily: 'ProximaNova',
    //         src: "url('/fonts/269860_2_0.eot'), url('/fonts/269860_2_0.eot?#iefix') format('embedded-opentype'), url('/fonts/269860_2_0.eot?#iefix') format('embedded-opentype'), url('/fonts/269860_2_0.woff') format('woff'), url('/fonts/269860_2_0.ttf') format('truetype')",
    //         fontWeight: 'bold',
    //     }
    // ]
};

const keyFramesStyles = jss.createStyleSheet(keyframesStyle as any).attach();

const genStyleClasses: ITKUIGenStyleClasses = {

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
        animation: keyFramesStyles.keyframes.spin + ' 1.5s linear infinite'
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
        },
        '& polygon': {
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

    overflowEllipsis: {
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block'
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

    // TODO: maybe move to a stylesheet that can be customized on SDK config.
    link: {
        textDecoration: 'underline',
        cursor: 'pointer',
        opacity: '.8',
        '&:hover': {
            opacity: '1'
        }
    },

    // Element selector styles, and other general selector styles, to be applied just to elements 'below' element(s)
    // with .root className. This avoids applying styles to elements 'outside' the SDK when it's embedded on client
    // webapp.
    root: {
        '& input::-ms-clear': {
            display: 'none'
        },
        '& input[type=text]': {
            padding: '1px'
        },
        // --------------------------------------------------------------------------------------------------------
        // TODO: check if following rules are still necessary / convenient. Preserve them for now to avoid breaks.
        '& a[href*="//"]': {
            background: 'none',
            padding: 'unset',
            margin: 'unset',
            zIndex: 'unset',
            overflow: 'unset'
        },
        WebkitBoxSizing: 'border-box',
        MozBoxSizing: 'border-box',
        boxSizing: 'border-box',
        lineHeight: 'normal',
        '& *': {
            boxShadow: 'none',     // To avoid glow effect on focus
            outline: 'none!important',  // To avoid glow effet on focus
            WebkitBoxSizing: 'border-box',
            MozBoxSizing: 'border-box',
            boxSizing: 'border-box',
        }
        // --------------------------------------------------------------------------------------------------------
    },

    // Use this class to mark elements to be highlighted on focus.
    focusTarget: {
        boxShadow: 'none'
    },

    userIsTabbing: {
        ['& $root input[type=text]:focus,' +
        '& $root button:focus,' +
        '& $root a:focus,' +
        '& $root select:focus,' +
        '& $root textarea:focus,' +
        '& $root div:focus,'
        // +    // TODO: for some reason next $focusTarget reference is translated to focus-target, do doesn't match the style.
        // '& $focusTarget:focus'
            ]: {
            // outline: '2px solid #024dff',
            boxShadow: '0px 0px 3px 3px #024dff!important'  // To prevail to boxShadow: none of resetStyles.
        },
        // '& $root $focusTarget': {
        //     display: 'flex'
        // }
    }

};

const genStyleCreators: ITKUIGenStyleCreators = {
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
    }),
};

const genStyles = {...genStyleClasses, ...genStyleCreators};
const genClassNames: Record<keyof ITKUIGenStyleClasses, string> = jss.createStyleSheet(genStyleClasses as any).attach().classes;

const otherStyles = {
    // TODO: check if media queries work, or need to use a jss plugin.
    ['@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)']: {
        /* IE10+ CSS styles go here */
        '@global': {
            ['.' + genClassNames.root]: {
                '& button': {
                    // background: 'none',
                    fontFamily: 'inherit',
                    // color: 'inherit'
                }
            },
            '*': {
                MsOverflowStyle: 'none'
            }
        }
    },
    '@global': {
        '.ReactModalPortal': {
            'zIndex': '1080'
        },

        '.ReactModal__Overlay': {
            'zIndex': '1080'
        }
    }
};

jss.createStyleSheet(otherStyles as any).attach();

export default genStyles;
export {genClassNames};