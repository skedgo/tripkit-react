import { TKUITheme, white } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIStripePaymentCardDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%',
        padding: '16px'
    },
    paymentForm: {
        marginTop: '20px'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        position: 'absolute',
        top: '0',
        background: white(1, theme.isDark),
        height: '100%',
        width: '100%'
    }
});