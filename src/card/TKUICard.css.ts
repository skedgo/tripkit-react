import genStyles from "../css/GenStyle.css";
import {TKUICardStyle, TKUICardProps, CardPresentation, hasHandle} from "./TKUICard";
import {TKUIStyles} from "../jss/StyleHelper";
import {cardSpacing, queryWidth, tKUIColors, TKUITheme} from "../jss/TKUITheme";
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
            }
        },

        main: {
            height: '100%',
            backgroundColor: 'white',
            fontFamily: theme.fontFamily,
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)',
            borderRadius: (props: TKUICardProps) =>
                props.presentation === CardPresentation.MODAL || !DeviceUtil.isTouch() ? '12px' :
                props.presentation === CardPresentation.SLIDE_UP
                || props.presentation === CardPresentation.SLIDE_UP_STYLE ? '12px 12px 0 0' : '0',
            ...genStyles.flex,
            ...genStyles.column,
            overflow: (props: TKUICardProps) => props.overflowVisible ? 'visible' : 'hidden'
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
            color: 'black',
            ...genStyles.flex,
            ...genStyles.column
        },

        subHeader: {
            padding: '0 16px',
            borderBottom: (props: TKUICardProps) => props.headerDividerVisible !== false ?
                '1px solid ' + tKUIColors.black4 : undefined
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
            ...genStyles.textGray
        },

        btnClear: {
            ...resetStyles.button,
            height: '24px',
            width: '24px',
            padding: '6px',
            cursor: 'pointer',
            '& svg path': {
                fill: tKUIColors.black1
            },
            '&:hover svg path, &:active svg path': {
                fill: tKUIColors.black
            }
        },

        iconClear: {
            color: 'black',
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
            backgroundColor: tKUIColors.black2,
            marginTop: '6px'
        },

    });