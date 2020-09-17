import genStyles from "../css/GenStyle.css";
import {TKUICardStyle, TKUICardProps, CardPresentation, hasHandle} from "./TKUICard";
import {TKUIStyles} from "../jss/StyleHelper";
import {black, cardSpacing, colorWithOpacity, queryWidth, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";

export const tKUICardDefaultStyle: TKUIStyles<TKUICardStyle, TKUICardProps> =
    (theme: TKUITheme) => ({
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
            '&>*': {
                paddingBottom: (props: TKUICardProps) => !DeviceUtil.isTouch() ? cardSpacing(props.landscape) + 'px' : '0'
            },
            boxSizing: 'border-box'
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
            overflow: (props: TKUICardProps) => props.overflowVisible ? 'visible' : 'hidden',
            ...theme.cardBackground
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

        header: {
            // If !hasHandle(props) set padding top of 15px to compensate 15px height handle
            padding: (props: TKUICardProps) => hasHandle(props) ? '0 12px 10px 16px' : '10px 12px 10px 16px',
            color: black(0, theme.isDark),
            ...genStyles.flex,
            ...genStyles.column
        },

        subHeader: {
            padding: '0 16px',
            borderBottom: (props: TKUICardProps) => props.headerDividerVisible !== false ?
                '1px solid ' + black(4, theme.isDark) : undefined
        },

        body: {
            ...genStyles.grow
        },

        headerTop: {
            ...genStyles.flex,
            ...genStyles.grow,
            ...genStyles.spaceBetween,
            ...genStyles.alignCenter
        },

        title: {
            ...genStyles.fontL,
        },

        subtitle: {
            ...genStyles.fontM,
            ...theme.textColorGray
        },

        btnClear: {
            ...resetStyles.button,
            height: '24px',
            width: '24px',
            padding: '6px',
            cursor: 'pointer',
            '& svg path': {
                fill: black(1, theme.isDark)
            },
            '&:hover svg path, &:active svg path': {
                fill: black(0, theme.isDark)
            }
        },

        iconClear: {
            width: '100%',
            height: '100%'
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

    });