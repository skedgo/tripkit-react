import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUISidebarProps, TKUISidebarStyle} from "./TKUISidebar";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUISidebarDefaultStyle: TKUIStyles<TKUISidebarStyle, TKUISidebarProps> =
    (theme: TKUITheme) => ({
        modalContainer: {
            zIndex: '1005!important',
            background: 'none!important',
            fontFamily: theme.fontFamily,
            // The +5px is due to shadow being on modal.
            width: '305px',
            paddingRight: '5px',
            ...genStyles.flex,
            justifyContent: 'flex-start!important',
            WebkitJustifyContent: 'flex-start!important'
        },
        modal: {
            backgroundColor: 'white',
            height: '100%',
            width: '100%',
            // Shadow needs to be here since modalContainer hides a little while after modal.
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
            ...genStyles.grow,
            ...genStyles.alignStart,
            padding: '20px 0',
            '&>*': {
                marginBottom: '10px'
            }
        },
        nativeAppLinksPanel: {
            background: '#154c7b',
            color: 'white',
            padding: '20px'
        }
    });