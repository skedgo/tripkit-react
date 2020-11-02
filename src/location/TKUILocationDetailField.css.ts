import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationDetailFieldProps, TKUILocationDetailFieldStyle} from "./TKUILocationDetailField";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUILocationDetailFieldDefaultStyle: TKUIStyles<TKUILocationDetailFieldStyle, TKUILocationDetailFieldProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        icon: {
            width: '24px',
            height: '24px',
            marginRight: '10px',
            '& > *': {
                width: '100%',
                height: '100%'
            },
            '& path': {
                fill: theme.colorPrimary
            }
        },
        details: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.spaceBetween,
            ...genStyles.grow,
            padding: '10px 10px 10px 0',
            ...theme.divider
        },
        title: {
            ...genStyles.fontM,
            ...theme.textColorDefault,
            '& > a': {
                color: theme.colorPrimary,
                textDecoration: 'none'
            }
        },
        subtitle: {
            ...genStyles.fontS,
            ...theme.textColorGray,
            '& > a': {
                ...theme.textColorGray,
                textDecoration: 'none'
            }
        }
    });