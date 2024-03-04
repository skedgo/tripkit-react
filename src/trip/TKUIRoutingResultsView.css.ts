import genStyles from "../css/GenStyle.css";
import { black, colorWithOpacity, TKUITheme, white } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";
import Constants from "../util/Constants";
import DeviceUtil from "../util/DeviceUtil";
import { TimePreference } from "../model/RoutingQuery";

export const tKUIResultsDefaultStyle = (theme: TKUITheme) => ({
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
        margin: '5px',
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
        backgroundImage: 'url(' + Constants.absUrl(theme.isLight ? "/images/ic-sort.svg" : "/images/ic-sort-dark.svg") + ')!important',
        backgroundRepeat: 'no-repeat!important',
        backgroundPosition: '10px 50%!important',
        backgroundSize: '18px',
        paddingLeft: '35px',
    },
    noResults: {
        ...theme.textSizeBody,
        ...theme.textColorDisabled,
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        margin: '24px 0',
        textAlign: 'center'
    },
    footer: {
        flexWrap: 'wrap',
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        ...DeviceUtil.isAndroid && {
            ...genStyles.wrap,
            '&>*:not(:first-child)': {
                marginLeft: 'auto'
            }
        },
        padding: '6px 5px',
        '& > *': {
            height: '28px!important'
        }
    },
    timeContainer: {
        ...genStyles.flex
    },
    timePrefSelect: {
        ...genStyles.flex,
        minWidth: '97px',
        border: '1px solid ' + black(4, theme.isDark),
        borderRightColor: (({ value }) => (value && value.value !== TimePreference.NOW) ? colorWithOpacity(theme.colorPrimary, .5) : undefined) as any,
        borderRadius: (({ value }) => (value && value.value !== TimePreference.NOW) ? '40px 0 0 40px' : '40px') as any,
        background: (({ value }) => (value && value.value !== TimePreference.NOW) ? colorWithOpacity(theme.colorPrimary, .2) : 'none') as any,
        '& *': {
            ...theme.textSizeCaption,
            ...theme.textWeightSemibold,
            color: (({ value }) => (value && value.value !== TimePreference.NOW) ? (theme.colorPrimary + '!important') : black(1, theme.isDark) + '!important') as any
        },
        '& path': {
            fill: (({ value }) => (value && value.value !== TimePreference.NOW) ? theme.colorPrimary : black(1, theme.isDark)) as any
        }
    },
    timePrefIcon: {
        width: '18px',
        height: '18px',
        marginLeft: '6px'
    },
    datePicker: {
        border: '1px solid ' + black(4, theme.isDark),
        minWidth: '97px',
        borderRadius: '0 40px 40px 0!important',
        padding: '0 11px',
        background: colorWithOpacity(theme.colorPrimary, .2),
        borderLeft: 'none',
        color: theme.colorPrimary,
        marginRight: '5px',
        whiteSpace: 'nowrap',
        height: '28px'
    },
    transportsBtn: {
        ...resetStyles.button,
        border: '1px solid ' + black(4, theme.isDark),
        borderRadius: '40px',
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        ...theme.textSizeCaption,
        ...theme.textWeightSemibold,
        ...theme.textColorDefault,
        marginLeft: 'auto',
        '& svg': {
            marginLeft: '5px'
        }
    }
});