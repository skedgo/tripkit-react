import { black, colorWithOpacity, important, TKUITheme } from "../jss/TKUITheme";
import { TKUIButtonProps, TKUIButtonType } from "./TKUIButton";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUIButtonDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...resetStyles.button,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.center,
        ...theme.textSizeBody,
        ...theme.textWeightSemibold,
        fontFamily: theme.fontFamily,
        '& svg': {
            width: '100%',
            height: '100%'
        }
    },

    primary: {
        backgroundColor: theme.colorPrimary,
        color: 'white',
        padding: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.PRIMARY_VERTICAL) ? '8px' :
                props.type === TKUIButtonType.PRIMARY_LINK ? undefined : '8px 20px',
        ...genStyles.borderRadius(20),
        height: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '40px' : 'initial',
        width: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '40px' : 'initial',
        '&:hover': {
            backgroundColor: colorWithOpacity(theme.colorPrimary, .9)
        },
        '&:disabled': {
            backgroundColor: colorWithOpacity(theme.colorPrimary, .8), // To get >= 4.5:1 contrast
            cursor: 'initial'
        },
        '&:active': {
            // Until integrate library to decrease color luminosity.
            // backgroundColor: '#079541'
            backgroundColor: theme.colorPrimary
        },
    },

    secondary: {
        background: 'none',
        ...theme.textColorDefault,
        padding: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '6px' : '6px 20px',
        ...genStyles.borderRadius(20),
        height: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '40px' : 'initial',
        width: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '40px' : 'initial',
        border: '2px solid ' + black(4, theme.isDark),
        '&:hover': {
            borderColor: black(2, theme.isDark),
        },
        '&:disabled': {
            borderColor: black(4, theme.isDark),
            opacity: '.7',
            cursor: 'initial'
        },
        '&:active': {
            borderColor: black(4, theme.isDark),
            backgroundColor: black(5, theme.isDark)
        },
        '& svg': {
            color: black(1, theme.isDark)
        }
    },

    vertical: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter,
        ...theme.textSizeBody,
        ...theme.textWeightSemibold,
        ...important(theme.textColorDefault),
        textAlign: 'center'
    },

    link: {
        color: theme.colorPrimary,
        '&:disabled': {
            color: colorWithOpacity(theme.colorPrimary, .5),
            cursor: 'initial'
        }
    },

    iconContainer: {
        width: '24px',
        height: '24px',
        marginRight: (props: TKUIButtonProps) =>
            (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '0' : '16px',
        '& svg': {
            ...genStyles.svgFillCurrColor
        },
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter
    }

});