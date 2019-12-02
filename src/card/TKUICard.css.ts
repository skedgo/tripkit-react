import genStyles from "../css/GenStyle.css";
import {TKUICardStyle, TKUICardProps, CardPresentation} from "./TKUICard";
import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUICardDefaultStyle: TKUIStyles<TKUICardStyle, TKUICardProps> =
    (theme: TKUITheme) => ({

        modalContainer: {
            zIndex: '1000!important',
            top: '190px!important',
            left: '5px!important',
            padding: '5px 5px 0 5px',
            right: 'auto!important',
            width: '450px',
            alignItems: 'unset!important',
            background: 'none!important',
            // Warn: in Safari overflow property does not override it's specific variants overflow-x and overflow-y,
            // so need to explicitly set overflowY to hidden to override overflowY value.
            overflowY: 'hidden!important'
        },

        modal: {
            width: '100%'
        },

        main: {
            height: '100%',
            backgroundColor: 'white',
            fontFamily: theme.fontFamily,
            boxShadow: (props: TKUICardProps) =>
                (props.presentation === CardPresentation.SLIDE_UP || props.presentation === CardPresentation.MODAL) ?
                '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' : 'none',
            borderRadius: (props: TKUICardProps) => props.presentation === CardPresentation.MODAL ? '12px' :
                props.presentation === CardPresentation.SLIDE_UP ? '12px 12px 0 0' : '0',
            ...genStyles.flex,
            ...genStyles.column
        },

        header: {
            padding: '12px 16px',
            color: 'black',
            borderBottom: '1px solid ' + tKUIColors.black4
        },

        body: {
            ...genStyles.scrollableY,
            ...genStyles.grow
        },

        headerLeft: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow
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
        }

    });