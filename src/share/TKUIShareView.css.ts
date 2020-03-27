import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIShareViewProps, TKUIShareViewStyle} from "./TKUIShareView";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";
import {DeviceUtil, genStylesJSS} from "../index";

export const tKUIShareViewDefaultStyle: TKUIStyles<TKUIShareViewStyle, TKUIShareViewProps> =
    (theme: TKUITheme) => ({
        main: {
            fontFamily: theme.fontFamily,
            padding: '15px',
            ...genStyles.flex,
            ...genStyles.column,
            '& *': {
                fontFamily: theme.fontFamily
            }
        },
        qrSharePanel: {
            color: theme.colorPrimary,
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignCenter,
            '& > *': {
                marginTop: '15px'
            }
        },
        qrLabel: {
            textAlign: 'center'
        },
        qrCode: {
            height: '120px',
            width: '120px'
        },
        qrCodeImg: {
            height: '100%',
            width: '100%'
        },
        copyLinkPanel: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        linkBox: {
            ...resetStyles.input,
            border: '1px solid ' + tKUIColors.black1,
            height: '30px',
            padding: '0 5px',
            ...genStyles.borderRadius(5),
            ...DeviceUtil.isPhone ? genStylesJSS.fontM : genStylesJSS.fontS,
            ...genStyles.grow
        },
        linkIcon: {
            width: '20px',
            height: '20px',
            marginLeft: '10px',
            cursor: 'pointer'
        },
        separation: {
            paddingBottom: '30px',
            borderBottom: '1px solid lightgray',
            marginBottom: '30px'
        }
    });