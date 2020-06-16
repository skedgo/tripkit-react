import {TKUIStyles} from "../jss/StyleHelper";
import {colorWithOpacity, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIButtonProps, TKUIButtonStyle, TKUIButtonType} from "./TKUIButton";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIButtonDefaultStyle: TKUIStyles<TKUIButtonStyle, TKUIButtonProps> =
    (theme: TKUITheme) => ({
        main: {
            ...resetStyles.button,
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.center,
            ...genStyles.fontM,
            fontFamily: theme.fontFamily,
            padding: (props: TKUIButtonProps) =>
                (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '6px' :
                    props.type === TKUIButtonType.PRIMARY_LINK ? undefined : '6px 20px',
            ...genStyles.borderRadius(20),
            '& svg': {
                width: '100%',
                height: '100%'
            },
            height: (props: TKUIButtonProps) =>
                (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '40px' : 'initial',
            width: (props: TKUIButtonProps) =>
                (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '40px' : 'initial'
        },

        primary: {
            backgroundColor: theme.colorPrimary,
            color: 'white',
            padding: (props: TKUIButtonProps) =>
                (props.type === TKUIButtonType.PRIMARY_VERTICAL) ? '8px' :
                    props.type === TKUIButtonType.PRIMARY_LINK ? undefined : '8px 20px',
            '&:hover': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .5)
            },
            '&:disabled': {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .5),
                cursor: 'initial'
            },
            '&:active': {
                backgroundColor: '#079541'
            },
        },

        secondary: {
            background: 'none',
            color: 'black',
            padding: (props: TKUIButtonProps) =>
                (props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '6px' : '6px 20px',
            border: '2px solid ' + tKUIColors.black4,
            '&:hover': {
                borderColor: tKUIColors.black2,
            },
            '&:disabled': {
                borderColor: tKUIColors.black4,
                opacity: '.7',
                cursor: 'initial'
            },
            '&:active': {
                borderColor: tKUIColors.black4,
                backgroundColor: tKUIColors.black5
            },
            '& svg': {
                color: tKUIColors.black1
            }
        },

        link: {
            color: theme.colorPrimary
        },

        iconContainer: {
            width: '24px',
            height: '24px',
            marginRight: (props: TKUIButtonProps) =>
                (props.type === TKUIButtonType.PRIMARY_VERTICAL || props.type === TKUIButtonType.SECONDARY_VERTICAL) ? '0' : '15px',
            '& svg': {
                ...genStyles.svgFillCurrColor
            },
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter
        },

        verticalPanel: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignCenter,
            ...genStyles.fontM,
            textAlign: 'center'
        }

    });