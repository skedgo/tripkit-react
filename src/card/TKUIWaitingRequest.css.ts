import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIWaitingRequestProps, TKUIWaitingRequestStyle} from "./TKUIWaitingRequest";
import {black, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIWaitingDefaultStyle: TKUIStyles<TKUIWaitingRequestStyle, TKUIWaitingRequestProps> =
    (theme: TKUITheme) => ({
        main: {
            position: 'absolute',
            top: '0',
            width: '100%',
            height: '100%',
            ...theme.modalFog,
            zIndex: '1050',
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter
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
            ...genStyles.alignCenter
        },
        waitingMessage: {
            fontWeight: 'bold',
            marginBottom: '5px',
            ...genStyles.fontM,
            color: black(1, theme.isDark)
        },
        iconLoading: {
            margin: '10px',
            width: '40px',
            height: '40px',
            color: '#6d6d6d',
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
        }
    });