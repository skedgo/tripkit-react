import {badgeColor, TKUITripRowProps, TKUITripRowStyle} from "./TKUITripRow";
import {TKUIStyles} from "../jss/StyleHelper";
import {black, TKUITheme, white} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {rowSelectedStyle, rowStyle} from "../service/TKUIServiceDepartureRow.css";

export const tKUITripRowDefaultStyle: TKUIStyles<TKUITripRowStyle, TKUITripRowProps> =
    (theme: TKUITheme) => ({
        main: {
            background: white(0, theme.isDark),
            borderTop: '1px solid ' + black(4, theme.isDark),
            borderRight: '1px solid ' + black(4, theme.isDark),
            borderBottom: '1px solid ' + black(4, theme.isDark),
            cursor: 'pointer'
        },
        badge: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.fontM,
            padding: '12px 10px 0',
            fontWeight: 'bold',
            color: (props: TKUITripRowProps) => props.badge && badgeColor(props.badge),
            ...genStyles.svgFillCurrColor,
            '& svg': {
                width: '16px',
                height: '16px',
                marginRight: '10px',
            }
        },
        info: {
            color: black(1, theme.isDark),
            ...genStyles.fontS
        },
        trackAndAction: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            marginTop: '10px'
        },
        track: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            whiteSpace: 'nowrap',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            '& > *': {
                marginRight: '3px'
            }
        },
        footer: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            padding: '12px 0',
            '& > *': {
                margin: '0 10px'
            }
        },
        alternative: {
            ...rowStyle(theme),
            borderBottom: '1px solid ' + black(4, theme.isDark)
        },
        selectedAlternative: {
            ...rowSelectedStyle(theme)
        },
        pastAlternative: {
            opacity: '.4'
        },
        crossOut: {
            borderTop: '1px solid ' + black(0, theme.isDark),
            position: 'absolute',
            top: '50%',
            width: '100%',
            zIndex: '1'
        }
    });