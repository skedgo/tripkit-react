import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUISidebarProps, TKUISidebarStyle} from "./TKUISidebar";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUISidebarDefaultStyle: TKUIStyles<TKUISidebarStyle, TKUISidebarProps> =
    (theme: TKUITheme) => ({
        modalContainer: {
            zIndex: '1005!important',
            fontFamily: theme.fontFamily,
            paddingRight: '5px',
            ...genStyles.flex,
            justifyContent: 'flex-start!important',
            WebkitJustifyContent: 'flex-start!important',
            background: 'rgba(255, 255, 255, 0.75)!important',
        },
        modalClosed: {  // Workaround to react-drag-drawer issue: modalContainer takes a while to dissapear
            background: 'none!important',
        },
        modal: {
            backgroundColor: 'white',
            width: '300px',
            height: '100%',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
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
            ...genStyles.noShrink,
            height: '90px',
            padding: '0 20px',
            borderBottom: '1px solid ' + tKUIColors.black4
        },
        closeBtn: {
            ...resetStyles.button,
            '& svg': {
                width: '24px',
                height: '24px',
                padding: '6px',
                '& path': {
                    fill: tKUIColors.black1
                }
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
            ...genStyles.grow,
            ...genStyles.alignStart,
            padding: '16px 8px 0 8px',
            '&>*': {
                marginBottom: '8px'
            }
        },
        menuItem: {
            padding: '8px 16px!important',
            '&:hover': {
                background: theme.isLight ? tKUIColors.black5 : tKUIColors.white5
            },
            ...theme.textWeightRegular,
            color: tKUIColors.black1 + '!important',
            border: 'none!important',
            width: '100%!important',
        },
        nativeAppLinksPanel: {
            background: '#154c7b',
            color: 'white',
            padding: '16px 24px 20px 24px'
        },
        nativeAppsTitle: {
            ...theme.textSizeBody,
            ...theme.textWeightRegular,
            marginBottom: '16px'
        },
        nativeAppLinks: {
            '&>*:last-child': {
                marginTop: '8px'
            }
        }
    });