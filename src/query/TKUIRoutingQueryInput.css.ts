import { TKUIRoutingQueryInputProps } from "./TKUIRoutingQueryInput";
import genStyles from "../css/GenStyle.css";
import { black, colorWithOpacity, important, tKUIColors, TKUITheme } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";
import { TimePreference } from "../model/RoutingQuery";

export const tKUIRoutingQueryInputDefaultStyle = (theme: TKUITheme) => ({
    btnBack: {
        ...resetStyles.button,
        padding: '0',
        margin: '10px',
        height: '24px',
        width: '24px',
        cursor: 'pointer',
        '& path': {
            fill: black(1, theme.isDark)
        }
    },
    fromToPanel: {
        marginBottom: (props: TKUIRoutingQueryInputProps) => !props.portrait ? '20px' : '0',
        marginTop: (props: TKUIRoutingQueryInputProps) => !props.portrait && !props.title && !props.onClearClicked ? '10px' : '0',
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    fromToInputsPanel: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        '& input': {
            ...important(theme.textSizeBody),
            lineHeight: '30px!important',
            ...theme.textColorDefault
        },
        '& input::placeholder': {
            ...theme.textSizeBody,
            ...theme.textColorDisabled
        }
    },
    locSelector: {
        padding: '9px 15px',
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        ...genStyles.alignSelfStretch
    },
    locIcon: {
        width: '11px',
        height: '11px',
        boxSizing: 'border-box',
        border: '1px solid ' + black(1, theme.isDark),
        ...genStyles.borderRadius(50, "%"),
        margin: '2px 0'
    },
    locTarget: {
        borderColor: theme.colorPrimary,
        backgroundColor: theme.colorPrimary
    },
    locLine: {
        width: '1px',
        height: '14px',
        background: black(1, theme.isDark)
    },
    divider: {
        borderBottom: '1px solid ' + black(theme.isHighContrast ? 1 : 4, theme.isDark)
    },
    swap: {
        ...resetStyles.button,
        cursor: 'pointer',
        padding: '0',
        margin: '10px',
        boxSizing: 'content-box!important',
        '& path': {
            fill: black(1, theme.isDark)
        }
    },
    footer: {
        flexWrap: 'wrap',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        borderTop: '1px solid ' + black(theme.isHighContrast ? 1 : 4),
        padding: '6px 12px',
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        '& > *': {
            height: '28px!important'
        }
    },
    timeContainer: {
        ...genStyles.flex,
        '& > *:not(:first-child)': {
            fontSize: '16px'
        }
    },
    timePrefSelect: {
        ...genStyles.flex,
        minWidth: '97px',
        border: '1px solid ' + black(4, theme.isDark),
        borderRightColor: ({ value }) => value.value !== TimePreference.NOW ? colorWithOpacity(theme.colorPrimary, .5) : undefined,
        borderRadius: ({ value }) => value.value !== TimePreference.NOW ? '40px 0 0 40px' : '40px',
        background: ({ value }) => value.value !== TimePreference.NOW ? colorWithOpacity(theme.colorPrimary, .2) : 'none',
        '& *': {
            ...theme.textSizeCaption,
            fontSize: 'clamp(14px, .875rem, 16px)',
            lineHeight: 'clamp(20px, 1.25rem, 24px)',
            ...theme.textWeightSemibold,
            color: ({ value }) => value.value !== TimePreference.NOW ? (theme.colorPrimary + '!important') : black(1, theme.isDark) + '!important'
        },
        '& path': {
            fill: ({ value }) => value.value !== TimePreference.NOW ? theme.colorPrimary : black(1, theme.isDark)
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
        height: '28px!important'
    },
    transportsBtn: {
        ...resetStyles.button,
        border: '1px solid ' + black(4, theme.isDark),
        borderRadius: '40px',
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        ...theme.textSizeCaption,
        fontSize: 'clamp(14px, .875rem, 16px)',
        lineHeight: 'clamp(20px, 1.25rem, 24px)',
        ...theme.textWeightSemibold,
        ...theme.textColorDefault,
        marginLeft: 'auto'
    }
});