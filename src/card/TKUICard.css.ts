import genStyles from "../css/GenStyle.css";
import {TKUICardStyle, TKUICardProps, CardPresentation, hasHandle} from "./TKUICard";
import {TKUIStyles} from "../jss/StyleHelper";
import {cardSpacing, queryWidth, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

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
            }
        },

        main: {
            height: '100%',
            backgroundColor: 'white',
            fontFamily: theme.fontFamily,
            boxShadow: (props: TKUICardProps) =>
                (props.presentation === CardPresentation.SLIDE_UP || props.presentation === CardPresentation.SLIDE_UP_STYLE
                    || props.presentation === CardPresentation.MODAL) ?
                '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' : 'none',
            borderRadius: (props: TKUICardProps) => props.presentation === CardPresentation.MODAL ? '12px' :
                props.presentation === CardPresentation.SLIDE_UP
                || props.presentation === CardPresentation.SLIDE_UP_STYLE ? '12px 12px 0 0' : '0',
            ...genStyles.flex,
            ...genStyles.column
        },

        innerMain: {
            height: '100%',
            width: '100%',
            ...genStyles.flex,
            ...genStyles.column
        },

        header: {
            // If !hasHandle(props) set padding top of 15px to compensate 15px height handle
            padding: (props: TKUICardProps) => hasHandle(props) ? '0 16px' : '15px 16px 12px',
            color: 'black',
        },

        subHeader: {
            padding: '0 16px',
            borderBottom: '1px solid ' + tKUIColors.black4
        },

        body: {
            ...genStyles.grow
        },

        headerLeft: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow,
            ...genStyles.alignStart
        },

        title: {
            ...genStyles.fontL,
        },

        subtitle: {
            ...genStyles.fontM,
            ...genStyles.textGray
        },

        btnClear: {
            ...resetStyles.button,
            padding: '0',
            height: '24px',
            width: '24px',
            cursor: 'pointer',
            ...genStyles.alignSelfStart
        },

        iconClear: {
            color: 'black',
            width: '100%',
            height: '100%',
            ...genStyles.svgFillCurrColor
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
            backgroundColor: tKUIColors.black2,
            marginTop: '6px'
        },

    });