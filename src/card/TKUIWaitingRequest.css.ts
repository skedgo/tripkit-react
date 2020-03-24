import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIWaitingRequestProps, TKUIWaitingRequestStyle} from "./TKUIWaitingRequest";
import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIWaitingDefaultStyle: TKUIStyles<TKUIWaitingRequestStyle, TKUIWaitingRequestProps> =
    (theme: TKUITheme) => ({
        main: {
            position: 'absolute',
            top: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, .5)',
            zIndex: '1050',
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter
        },
        waitingBanner: {
            backgroundColor: 'white',
            fontFamily: theme.fontFamily,
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            padding: '10px 20px',
            ...genStyles.borderRadius(12),
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
            color: '#212a33c2'
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