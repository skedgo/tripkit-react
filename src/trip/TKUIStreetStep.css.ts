import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIStreetStepDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.divider,
        padding: '10px',
        marginLeft: '10px'
    },
    icon: {
        marginRight: '10px',
        height: '36px',
        width: '36px',
        '& svg': {
            height: '100%',
            width: '100%'
        },
        '& path': {
            fill: theme.colorPrimary
        }
    },
    column: {
        ...genStyles.flex,
        ...genStyles.column
    },
    title: {
        ...theme.textWeightSemibold
    },
    subtitle: {
        ...theme.textColorGray
    },
    tags: {
        ...genStyles.flex,
        ...genStyles.wrap
    },
    tag: {
        ...genStyles.borderRadius(20),
        ...genStyles.fontS,
        padding: '0 10px',
        marginBottom: '5px',
        '&:not(:last-child)': {
            marginRight: '5px'
        }
    }
});