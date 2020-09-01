import {black, colorWithOpacity, tKUIColors, TKUITheme} from "../jss/TKUITheme";
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
            background: (theme.isLight ? 'rgba(255, 255, 255, 0.75)' : colorWithOpacity(tKUIColors.black, .75)) + '!important',
            position: 'absolute'
        },
        modalClosed: {  // Workaround to react-drag-drawer issue: modalContainer takes a while to dissapear
            background: 'none!important',
        },
        modal: {
            ...theme.cardBackground,
            ...genStyles.borderRadius(0),
            width: '300px',
            height: '100%',
            ...genStyles.flex
        },
        main: {
            ...genStyles.flex,
            ...genStyles.grow,
            ...genStyles.column,
            ['@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)']: {
                /* IE10+ CSS styles go here */
                width: '100%'
            }
        },
        header: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            ...genStyles.alignCenter,
            ...genStyles.noShrink,
            height: '90px',
            padding: '0 20px',
            borderBottom: '1px solid ' + black(4, theme.isDark)
        },
        closeBtn: {
            ...resetStyles.button,
            '& svg': {
                width: '24px',
                height: '24px',
                padding: '6px',
                '& path': {
                    fill: black(1, theme.isDark)
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
        nativeAppLinksPanel: {
            background: theme.isLight ? '#154c7b' : '#558ab7',
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