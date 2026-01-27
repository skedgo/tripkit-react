import genStyles from "../css/GenStyle.css";
import { TKUICardProps, CardPresentation } from "./TKUICard";
import { black, cardSpacing, colorWithOpacity, queryWidth, tKUIColors, TKUITheme } from "../jss/TKUITheme";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

export const tKUICardDefaultStyle = (theme: TKUITheme) => ({
    modalContainer: {
        // zIndex: '1000!important',
        // top: (props: TKUICardProps) => (props.top ? props.top : 190) + 'px!important',
        // right: 'auto!important',
        alignItems: 'unset!important',
        // Warn: in Safari overflow property does not override it's specific variants overflow-x and overflow-y,
        // so need to explicitly set overflowY to hidden to override overflowY value.
        // overflowY: 'hidden!important',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            width: queryWidth + 'px',
            left: cardSpacing() + 'px!important',
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            width: '100%',
            left: '0px!important',
            padding: '0 ' + cardSpacing(false) + 'px'
        },
        boxSizing: 'border-box'
    },
    // Stop using modalContent class, currently passed to react-modal as inline style, and use instead modal class, passed to react-modal as className.
    modalContent: {
        position: 'absolute',
        inset: '40px 40px 40px 50%',
        background: 'none',
        border: 'none',
        padding: '5px',
        transform: 'translate(-50%, 0)',
        width: '500px',
        overflow: 'auto',
        borderRadius: '4px',
        outline: 'none'
    },

    modal: {

    },

    modalOverlay: {
        backgroundColor: (theme.isLight ? 'rgba(255, 255, 255, 0.75)' : colorWithOpacity(tKUIColors.black, .75)),
    },

    main: {
        height: (props: TKUICardProps) =>
            props.presentation === CardPresentation.SLIDE_UP || props.presentation === CardPresentation.MODAL ? '100%' : undefined,
        fontFamily: theme.fontFamily,
        ...theme.textColorDefault,
        ...theme.textSizeBody,
        ...genStyles.flex,
        ...genStyles.column,
        overflow: 'hidden',
        ...theme.cardBackground
    },

    bottomSheetRoot: {
        fontFamily: theme.fontFamily,
        ...theme.textColorDefault,
        ...theme.textSizeBody,
        '& > div': {
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                width: queryWidth + 'px',
                left: cardSpacing() + 'px!important',
            }
        }
    },

    noDrag: {
        '& div[data-rsbs-header]': {
            paddingTop: '0!important',
            '&::before': {
                display: 'none'
            }
        }
    },

    '@global': {
        '[data-rsbs-overlay]': {
            zIndex: 'var(--bottom-sheet-z-index)!important'
        },
        '[data-rsbs-header]': {
            boxShadow: 'none!important',
            fontFamily: theme.fontFamily,
            paddingLeft: '0!important',
            paddingRight: '0!important',
            paddingBottom: '0!important'
        },
        '[data-rsbs-footer]': {
            boxShadow: 'none!important',
            fontFamily: theme.fontFamily,
            padding: 0
        },
        '[data-rsbs-scroll]': {
        },
        '[data-rsbs-content]': {
        }
    },

    mainForSlideUp: {
        ...genStyles.borderRadiusString('12px 12px 0 0')
    },

    innerMain: {
        height: '100%',
        width: '100%',
        ...genStyles.flex,
        ...genStyles.column
    },

    subHeader: {
        padding: (props: TKUICardProps) => props.landscape ? '0 16px' : '0 5px'
    },

    divider: {
        ...theme.divider
    },

    body: {
        ...genStyles.grow
    },

    handle: {
        height: '15px',
        ...genStyles.flex,
        ...genStyles.center,
    },

    handleLine: {
        width: '50px',
        height: '4px',
        ...genStyles.borderRadius(2),
        backgroundColor: black(2, theme.isDark),
        marginTop: '6px'
    },

    hidden: {
        display: 'none!important'
    }
});