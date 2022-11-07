// DONE: switch to react-jss v10 that provides createUseStyles, now that issue with hooks is fixed. Allow
// to get rid of @types/react-jss
// import {createUseStyles} from 'react-jss';
import { jss } from 'react-jss';

interface ITKUIGenStyleClasses {
    // TODO: see how to return to a typed version
    // flex: CSSProps<{}>;
    flex: any;
    column: any;
    center: any;
    spaceBetween: any;
    spaceAround: any;
    justifyStart: any;
    justifyEnd: any;
    alignCenter: any;
    alignStart: any;
    alignEnd: any;
    alignStretch: any;
    alignSelfCenter: any;
    alignSelfStart: any;
    alignSelfEnd: any;
    alignSelfStretch: any;
    grow: any;
    noShrink: any;
    wrap: any;
    animateSpin: any;
    transitionFadeOut: any;
    fadeOut: any;
    animateFadeOut: any;
    animateFadeIn: any;
    svgFillCurrColor: any;
    svgPathFillCurrColor: any;
    scrollableY: any;
    relative: any;
    hidden: any;
    rotate180: any;
    overflowEllipsis: any;

    fontL: any;
    fontM: any;
    fontS: any;
    fontSM: any;

    link: any;

    root: any;

    focusTarget: any;

    userIsTabbing: any;
}

interface ITKUIGenStyleCreators {
    borderRadius: (radius: number, unit?: string) => any;
    borderRadiusString: (value: string) => any;
    transformRotate: (angle: number, unit?: string) => any;
}

interface ITKUIGenStyle extends ITKUIGenStyleClasses, ITKUIGenStyleCreators { }

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
    '@keyframes leftSlideIn': {
        from: {
            transform: 'translate3d(-100%, 0, 0)'
        },
        to: {
            transform: 'translate3d(0, 0, 0)'
        }
    },
    '@keyframes leftSlideOut': {
        from: {
            transform: 'translate3d(0, 0, 0)'
        },
        to: {
            transform: 'translate3d(-100%, 0, 0)'
        }
    },
    '@keyframes fadeOut': {
        '0%': {
            opacity: '1',
            height: 'initial',
            overflow: 'visible'
        },
        '99%': {
            opacity: '0',
            height: 'initial',
            overflow: 'visible'
        },
        '100%': {
            opacity: '0',
            height: '0',
            overflow: 'hidden'            
        }
    },
    '@keyframes fadeIn': {
        '0%': {
            opacity: '0',
            height: '0',
            overflow: 'hidden'            
        },
        '1%': {
            opacity: '0',
            height: 'initial',
            overflow: 'visible'
        },
        '100%': {
            opacity: '1',
            height: 'initial',
            overflow: 'visible'
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

// Specify type any to avoid the following error. TODO find root cause.
// TS2742: The inferred type of 'keyFramesStyles' cannot be named without a reference to 'react-jss/node_modules/jss'. This is likely not portable. A type annotation is necessary.
export const keyFramesStyles: any = jss.createStyleSheet(keyframesStyle as any).attach();

const genStyleClasses: ITKUIGenStyleClasses = {

    flex: {
        ...{ display: '-webkit-flex' },
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

    alignEnd: {
        alignItems: 'flex-end',
        WebkitAlignItems: 'flex-end'
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

    alignSelfEnd: {
        alignSelf: 'flex-end',
        WebkitAlignSelf: 'flex-end'
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

    transitionFadeOut: {
        transition: 'opacity .5s 0s, height 0s .5s'        
    },

    fadeOut: {
        height: 0,
        opacity: 0,
        overflow: 'hidden'
    },

    animateFadeOut: {
        animationDuration: '.3s',
        animationName: keyFramesStyles.keyframes.fadeOut,
        animationTimingFunction: 'ease-in-out',
        animationFillMode: 'forwards'
    },

    animateFadeIn: {
        animationDuration: '.5s',        
        animationName: keyFramesStyles.keyframes.fadeIn,
        animationTimingFunction: 'ease-in-out',        
        animationFillMode: 'forwards'
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

    fontS: {
        fontSize: '14px',
        lineHeight: '20px'
    },

    fontSM: {
        fontSize: '12px',
        lineHeight: '16px'
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
        boxShadow: 'none',     // To avoid glow effect on focus
        outline: 'none!important',  // To avoid glow effect on focus
        '& *': {
            boxShadow: 'none',     // To avoid glow effect on focus
            outline: 'none!important',  // To avoid glow effect on focus
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
            '& $root input[type=email]:focus,' +
            '& $root input[aria-autocomplete=list]:focus,' +
            '& $root button:focus,' +
            '& $root a:focus,' +
            '& $root select:focus,' +
            '& $root textarea:focus,' +
            '& $root div:focus,' +
            '& $root:focus'
            // +    // TODO: for some reason next $focusTarget reference is translated to focus-target, so doesn't match the style.
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

    borderRadiusString: (value: string) => ({
        borderRadius: value,
        WebkitBorderRadius: value,
        MozBorderRadius: value
    }),

    transformRotate: (angle: number, unit: string = 'deg') => ({
        WebkitTransform: 'rotate(' + angle + unit + ')',
        MsTransform: 'rotate(' + angle + unit + ')',
        MozTransform: 'rotate(' + angle + unit + ')',
        transform: 'rotate(' + angle + unit + ')'
    }),
};

const genStyles = { ...genStyleClasses, ...genStyleCreators };
// @ts-ignore: avoid TS2740
const genClassNames: Record<keyof ITKUIGenStyleClasses, string> = jss.createStyleSheet(genStyleClasses as any).attach().classes;

const otherStyles = {
    // TODO: check if media queries work, or need to use a jss plugin.
    ['@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)']: {    /* IE10+ CSS */
        '@global': {
            ['.' + genClassNames.root]: {
                '& button': {
                    fontFamily: 'inherit',
                }
            },
            '*': {
                MsOverflowStyle: 'none'
            }
        }
    },
    ['@supports (-ms-accelerator:true)']: { /* Edge 12+ CSS */
        '@global': {
            '*': {
                MsOverflowStyle: 'none'
            }
        }
    },
    ['@supports (-ms-ime-align:auto)']: { /* Edge 16+ CSS */
        '@global': {
            '*': {
                MsOverflowStyle: 'none'
            },
        }
    },
    '@global': {
        '.ReactModalPortal': {
            'zIndex': '1080'
        },

        '.ReactModalPortalOnTop': {
            'zIndex': '1090'
        },

        '.ReactModal__Overlay': {
            'zIndex': '1080'
        },
        '.react-confirm-alert-overlay': {
            zIndex: '1099!important'
        },
        '.react-confirm-alert-body': {
            boxSizing: 'border-box',
            width: '100%!important'
        }
    }
};

jss.createStyleSheet(otherStyles as any).attach();

export const TK_FOCUS_TARGET_CLASS = 'tk-focus-target'

export default genStyles;
export { genClassNames };