import genStyles from "../css/GenStyle.css";
import {ITKUICardProps, ITKUICardStyle} from "./TKUICard";
import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKStyleProvider";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUICardDefaultStyle: TKUIStyles<ITKUICardStyle, ITKUICardProps> =
    (theme: TKUITheme) => ({

        modalContainer: {
            zIndex: '1000!important',
            top: '195px!important',
            right: 'auto!important',
            left: '10px!important',
            width: '450px',
            alignItems: 'unset!important',
            background: 'none!important',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            overflow: 'hidden'
        },

        modal: {
            width: '100%'
        },

        main: {
            height: '100%',
            backgroundColor: 'white',
            fontFamily: theme.fontFamily,
            ...genStyles.flex,
            ...genStyles.column
        },

        header: {
            padding: '12px 16px',
            color: 'black',
            borderBottom: '1px solid ' + tKUIColors.black4
        },

        body: {
            ...genStyles.scrollableY
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