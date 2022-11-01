import genStyles from "../css/GenStyle.css";
import { TKUITheme } from "../jss/TKUITheme";

export const tKUIUserPrioritiesDefaultStyle = (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            padding: '30px',
            '&>*': {
                marginBottom: '25px'
            }
        },
        priorities: {
            ...genStyles.flex,
            ...genStyles.column,
            '& > *': {
                ...genStyles.flex,
                ...genStyles.spaceBetween,
                marginBottom: '25px'
            },
            '& > *:last-child': {
                ...genStyles.alignSelfCenter
            }
        },
        priority: {
            ...genStyles.flex,
            ...genStyles.column,
            width: '45%',
            '& label': {
                textAlign: 'center',
                marginTop: '15px'
            }
        }
    });