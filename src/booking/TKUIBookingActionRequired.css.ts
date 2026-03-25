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
            flexGrow: 1,
            flexDirection: 'column',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid ' + black(isHighContrast ? 1 : 4, isDark),
            margin: '16px',
            '&:not(:first-child)': {
                marginTop: 0
            },
            position: 'relative'
        },
        mapArrow: {
            borderLeft: `18px solid ${theme.colorPrimary}`,
            borderBottom: '12px solid white',
            borderTop: '12px solid white',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            right: '-20px'
        },
        returnTripLabel: {
            ...theme.textSizeCaption,
            alignSelf: 'flex-start',
            color: white(),
            marginBottom: '16px',
            borderRadius: '4px',
            background: black(1),
            padding: '4px 8px'
        },
        body: {
            display: 'flex',
            flexGrow: 1
        },
        differencesContainer: {
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
        },
        mapContainer: {
            flexGrow: '1',
            width: '50%',
            display: 'flex',
            margin: '16px 0 16px 20px',
            borderRadius: '12px',
            overflow: 'hidden'
        },
        actions: {
            marginTop: 'auto',
            display: 'flex',
            margin: '20px 16px',
            '&>*': {
                flexGrow: 1,
                padding: '12px 16px!important',
                color: white() + '!important',
                borderRadius: '100px'
            },
            '&>*:not(:first-child)': {
                marginLeft: '16px'
            }
        }
    });
};
