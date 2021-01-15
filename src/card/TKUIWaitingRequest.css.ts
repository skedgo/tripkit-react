import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIWaitingRequestProps, TKUIWaitingRequestStyle} from "./TKUIWaitingRequest";
import {black, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIWaitingDefaultStyle: TKUIStyles<TKUIWaitingRequestStyle, TKUIWaitingRequestProps> =
    (theme: TKUITheme) => ({
        main: {
            position: 'absolute',
            zIndex: '1090',
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter
        },
        blocking: {
            top: '0',
            width: '100%',
            height: '100%',
            ...theme.modalFog
        },
        noBlocking: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        waitingBanner: {
            ...theme.cardBackground,
            fontFamily: theme.fontFamily,
            padding: '10px 20px',
            ...genStyles.flex,
            ...genStyles.column,
            minWidth: '100px',
            minHeight: '80px',
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.center,
            ...genStyles.alignCenter,
            maxWidth: '90%'
        },
        waitingMessage: {
            fontWeight: 'bold',
            marginBottom: '5px',
            ...genStyles.fontM,
            color: black(1, theme.isDark),
            textAlign: 'center',
            maxWidth: '100%'
        },
        iconLoading: {
            margin: '10px',
            width: '40px',
            height: '40px',
            color: black(1, theme.isDark),
            ...genStyles.alignSelfCenter,
            ...genStyles.animateSpin,
            ...genStyles.svgFillCurrColor
        },
        iconTick: {
            margin: '10px',
            width: '40px',
            height: '40px',
            color: theme.colorSuccess,
            ...genStyles.svgPathFillCurrColor
        },
        iconCross: {
            margin: '20px',
            width: '30px',
            height: '30px',
            ...genStyles.svgFillCurrColor,
            color: theme.colorError
        },
        btnClear: {
            ...resetStyles.button,
            ...genStyles.alignSelfEnd,
            height: '24px',
            width: '24px',
            padding: '6px',
            cursor: 'pointer',
            '& svg path': {
                fill: black(1, theme.isDark)
            },
            '&:hover svg path, &:active svg path': {
                fill: black(0, theme.isDark)
            }
        },
        iconClear: {
            width: '100%',
            height: '100%'
        },
    });