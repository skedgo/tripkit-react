import genStyles from "../css/GenStyle.css";
import { TKUITheme, black, white } from "../jss/TKUITheme";

export const tKUISignInFormDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        '& > *:not(:last-child)': {
            marginBottom: '15px'
        },
        '& input': {
            border: '1px solid ' + black(2, theme.isDark),
            ...genStyles.borderRadius(4),
            ...theme.textSizeBody,
            padding: '5px 10px'
        }
    },
    iconLoading: {
        width: '30px!important',
        height: '18px!important',
        margin: '3px 0',
        '& path': {
            fill: white()
        }
    },
    errorMessage: {
        color: theme.colorError,
        height: 0,
        margin: '-10px 0 35px!important'
    }
});