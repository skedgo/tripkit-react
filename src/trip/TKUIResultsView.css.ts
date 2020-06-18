import genStyles from "../css/GenStyle.css";
import {TKUIResultsViewProps, TKUIResultsViewStyle} from "./TKUIResultsView";
import Constants from "../util/Constants";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIResultsDefaultStyle: TKUIStyles<TKUIResultsViewStyle, TKUIResultsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            background: '#f5f6f7',
            minHeight: '100%'
        },
        row: {
            marginBottom: '15px',
        },
        iconLoading: {
            margin: '0 5px',
            width: '20px',
            height: '20px',
            color: '#6d6d6d',
            ...genStyles.alignSelfCenter,
            ...genStyles.animateSpin,
            ...genStyles.svgFillCurrColor
        },
        sortBar: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            padding: '10px',
            ...genStyles.fontS,
            color: tKUIColors.black1
        },
        sortSelect: {
            minWidth: '200px',
            ...genStyles.grow
        },
        sortSelectControl: {
            backgroundImage: 'url('+ Constants.absUrl("/images/ic-sort.svg") + ')!important',
            backgroundRepeat: 'no-repeat!important',
            backgroundPosition: '10px 50%!important',
            backgroundSize: '18px',
            paddingLeft: '35px',
            backgroundColor: '#00000000'
        },
        footer: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween
        },
        transportsBtn: {
            ...resetStyles.button,
            padding: '10px'
        },
        timePrefSelect: {
            minWidth: '92px'
        },
        noResults: {
            ...theme.textSizeBody,
            ...theme.textColorDisabled,
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter,
            margin: '24px 0',
            textAlign: 'center'
        }
    });