import { black, important, TKUITheme, white } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIStripePaymentCardDefaultStyle = (theme: TKUITheme) => ({
    main: {
        padding: '15px'
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
        backgroundColor: '#ffffffbf',
        height: '100%',
        width: '100%'
    }
});