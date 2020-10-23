import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIProfileViewProps, TKUIProfileViewStyle} from "./TKUIProfileView";
import genStyles from "../css/GenStyle.css";
import {black, important, TKUITheme} from "../jss/TKUITheme";

export const tKUIProfileViewDefaultStyle: TKUIStyles<TKUIProfileViewStyle, TKUIProfileViewProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '30px 0',
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
        link: {
            ...genStyles.link
        },
        checkboxRow: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            textTransform: 'capitalize'
        },
        optionSelect: {
            minWidth: '115px',
            padding: '0 10px',
            border: '2px solid ' + black(4, theme.isDark),
            borderRadius: '30px',
            '& *': {
                ...theme.textSizeCaption,
                ...theme.textWeightSemibold,
                ...important(theme.textColorDefault)
            },
            '& path': {
                fill: black(0, theme.isDark)
            },
            '&:hover': {
                borderColor: black(2, theme.isDark)
            },
            '&:active': {
                borderColor: black(4, theme.isDark),
                backgroundColor: black(5, theme.isDark)
            }
        }
    });