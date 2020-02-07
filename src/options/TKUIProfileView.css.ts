import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIProfileViewProps, TKUIProfileViewStyle} from "./TKUIProfileView";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIProfileViewDefaultStyle: TKUIStyles<TKUIProfileViewStyle, TKUIProfileViewProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '30px',
            height: '100%',
            ...genStyles.flex,
            ...genStyles.column,
            '& label': {
                ...genStyles.flex,
                ...genStyles.alignCenter
            },
            '& label img': {
                width: '20px',
                height: '20px',
                marginLeft: '10px',
                ...genStyles.noShrink
            },
            ['@media all and (-ms-high-contrast: none), (-ms-high-contrast: active)']: {
                /* IE10+ CSS styles go here */
                height: 'inherit'
            },
            ['@media (max-width: 400px)']: {
                padding: '15px'
            }
        },
        scrollPanel: {
            paddingBottom: '20px',
            ...genStyles.scrollableY
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            ...genStyles.fontM,
            marginBottom: '15px'
        },
        specialServices: {
            ...genStyles.flex,
            ...genStyles.justifyStart,
            '& > div': {
                ...genStyles.flex,
                ...genStyles.alignCenter
            },
            ['@media (min-width: 741px)']: {
                '& > div:not(:first-child)': {
                    marginLeft: '30px'
                }
            },
            ['@media (max-width: 740px)']: {
                ...genStyles.column,
                '& > div': {
                    marginBottom: '10px',
                    marginLeft: '0'
                }
            },
        },
        icon: {
            width: '24px',
            height: '24px',
            marginRight: '3px',
            ...genStyles.borderRadius(50, "%"),
            ...genStyles.noShrink
        },
        infoIcon: {
            width: '18px',
            height: '18px',
            marginLeft: '10px',
            ...genStyles.noShrink
        },
        tooltip: {
            maxWidth: '250px'
        },
        tooltipOverlay: {
            zIndex: '1100!important',
            '& .rc-tooltip-inner': {
                ...genStyles.flex,
                ...genStyles.alignCenter,
                fontFamily: theme.fontFamily,
                fontSize: '13px'
            }
        },
        checkboxGroup: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        }
    });