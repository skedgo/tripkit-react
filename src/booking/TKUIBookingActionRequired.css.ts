import genStyles from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";
import { tKUIBookingFormDefaultStyle } from "./TKUIBookingForm.css";

export const tKUIBookingActionRequiredDefaultStyle = (theme: TKUITheme) => {
    const { isHighContrast, isDark } = theme;
    return ({
        ...tKUIBookingFormDefaultStyle(theme),
        main: {
            ...genStyles.flex,
            ...genStyles.column
        },
        statusInfo: {
            background: theme.colorPrimary,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            color: white(0)
        },
        statusTitle: {
            display: 'flex',
            alignItems: 'center',
            ...genStyles.fontL,
            ...theme.textWeightBold,
            marginBottom: '10px'
        },
        statusIcon: {
            marginRight: '12px',
            '& path': {
                fill: white(0)
            }
        },
        fromToDetails: {
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid ' + black(isHighContrast ? 1 : 4, isDark),
            margin: '16px'
        },
        returnTripLabel: {
            ...theme.textSizeCaption,
            alignSelf: 'flex-start',
            color: white(),
            marginBottom: '16px',
            borderRadius: '4px',
            background: black(1),
            padding: '4px 8px'
        }
    });
};
