import genStyles from "../css/GenStyle.css";
import {TKUIRoutingResultsViewProps, TKUIRoutingResultsViewStyle} from "./TKUIRoutingResultsView";
import {black, important, TKUITheme, white} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {resetStyles} from "../css/ResetStyle.css";
import Constants from "../util/Constants";

export const tKUIResultsDefaultStyle: TKUIStyles<TKUIRoutingResultsViewStyle, TKUIRoutingResultsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            ...theme.secondaryBackground,
            minHeight: '100%'
        },
        row: {
            marginBottom: '15px',
        },
        iconLoading: {
            margin: '0 5px',
            width: '20px',
            height: '20px',
            color: black(1, theme.isDark),
            ...genStyles.alignSelfCenter,
            ...genStyles.animateSpin,
            ...genStyles.svgFillCurrColor
        },
        sortBar: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            padding: '10px',
            ...genStyles.fontS,
            '& *': {
                color: (theme.isLight ? '#666d71' : white(1)) + "!important"    // 4.50:1 contrast for AA
            }
        },
        sortSelect: {
            minWidth: '200px',
            ...genStyles.grow
        },
        sortSelectControl: {
            backgroundImage: 'url('+ Constants.absUrl(theme.isLight ? "/images/ic-sort.svg" : "/images/ic-sort-dark.svg") + ')!important',
            backgroundRepeat: 'no-repeat!important',
            backgroundPosition: '10px 50%!important',
            backgroundSize: '18px',
            paddingLeft: '35px',
        },
        footer: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween
        },
        transportsBtn: {
            ...resetStyles.button,
            padding: '10px',
            ...theme.textColorGray,
            whiteSpace: 'nowrap',
            '& svg': {
                marginLeft: '5px',
                ...genStyles.svgFillCurrColor
            }
        },
        timePrefSelect: {
            minWidth: '92px',
            '& *': {
                ...theme.textWeightSemibold,
                ...important(theme.textColorGray)
            },
            '& path': {
                fill: black(1, theme.isDark)
            }
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