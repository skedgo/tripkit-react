import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUISidebarProps, TKUISidebarStyle} from "./TKUISidebar";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUISidebarDefaultStyle: TKUIStyles<TKUISidebarStyle, TKUISidebarProps> =
    (theme: TKUITheme) => ({
        modalContainer: {
            zIndex: '1001!important',
            width: '300px',
            background: 'none!important',
            fontFamily: theme.fontFamily
        },
        modal: {
            backgroundColor: 'white',
            height: '100%',
            width: '100%',
            ...genStyles.flex
        },
        main: {
            ...genStyles.flex,
            ...genStyles.grow,
            ...genStyles.column
        },
        header: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            ...genStyles.alignCenter,
            height: '90px',
            padding: '0 20px',
            borderBottom: '1px solid ' + tKUIColors.black4
        },
        closeBtn: {
            ...resetStyles.button,
            '& svg': {
                width: '22px',
                height: '22px'
            }
        },
        body: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow
        },
        menuItems: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow
        },
        nativeAppLinksPanel: {
            background: '#154c7b',
            color: 'white',
            padding: '20px'
        }
    });