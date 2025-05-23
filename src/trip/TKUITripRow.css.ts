import { badgeColor, TKUITripRowProps } from "./TKUITripRow";
import { black, TKUITheme, white } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { rowSelectedStyle, rowStyle } from "../service/TKUIServiceDepartureRow.css";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUITripRowDefaultStyle = (theme: TKUITheme) => ({
    main: {
        background: white(0, theme.isDark),
        borderTop: '1px solid ' + black(4, theme.isDark),
        borderRight: '1px solid ' + black(4, theme.isDark),
        borderBottom: '1px solid ' + black(4, theme.isDark),
        cursor: 'pointer',
        ...genStyles.flex,
        ...genStyles.column
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
        ...genStyles.fontS,
        margin: '0 10px'
    },
    trackAndAction: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween,
        marginTop: '10px'
    },
    footer: {
        ...genStyles.flex,
        ...genStyles.spaceBetween,
        padding: '12px 0'
    },
    footerButtons: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        marginLeft: 'auto',
        '& > *': {
            margin: '0 10px'
        }
    },
    alternative: {
        ...resetStyles.button,
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
    },
    unavailableAlternative: {
        opacity: '.4'
    },
    availabilityInfo: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        color: theme.colorError,
        '& svg': {
            width: '20px',
            height: '20px',
            marginRight: '10px',
            ...genStyles.noShrink
        },
        '& path': {
            fill: theme.colorError
        }
    }
});