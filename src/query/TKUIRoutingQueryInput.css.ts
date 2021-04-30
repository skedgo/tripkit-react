import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle} from "./TKUIRoutingQueryInput";
import genStyles from "../css/GenStyle.css";
import {black, colorWithOpacity, tKUIColors, TKUITheme, white} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import {CSSProperties} from "react-jss";

export const tKUIRoutingQueryInputDefaultStyle: TKUIStyles<TKUIRoutingQueryInputStyle, TKUIRoutingQueryInputProps> =
    (theme: TKUITheme) => ({
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
            marginBottom: (props: TKUIRoutingQueryInputProps) => props.landscape ? '20px' : '0',
            marginTop: (props: TKUIRoutingQueryInputProps) => props.landscape && !props.title && !props.onClearClicked ? '10px' : '0',
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        fromToInputsPanel: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow,
            '& input': {
                fontSize: '16px!important',
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
            width: '12px',
            height: '12px',
            boxSizing: 'border-box',
            border: '2px solid ' + black(1, theme.isDark),
            ...genStyles.borderRadius(50, "%")
        },
        locTarget: {
            borderColor: theme.colorPrimary,
            backgroundColor: colorWithOpacity(theme.colorPrimary, .7)
        },
        dotIcon: {
            width: '2px',
            height: '2px',
            background: black(1, theme.isDark)
        },
        divider: {
            borderBottom: '1px solid ' + black(4, theme.isDark)
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
            ...theme.secondaryBackground,
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            borderTop: '1px solid ' + tKUIColors.black4,
            padding: '0 6px',
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween
        },
        transportsBtn: {
            ...resetStyles.button,
            padding: '10px 10px 10px 0',
            whiteSpace: 'nowrap',
            ...theme.textSizeCaption,
            ...theme.textWeightSemibold,
            color: theme.isLight ? '#666d71' : white(1)    // 4.50:1 contrast for AA
        },
        timePrefSelect: {
            minWidth: '97px',
            '& *': {
                ...theme.textSizeCaption,
                ...theme.textWeightSemibold,
                color: (theme.isLight ? '#666d71' : white(1)) + "!important"    // 4.50:1 contrast for AA
            },
            '& path': {
                fill: black(1, theme.isDark)
            }
        }
    });