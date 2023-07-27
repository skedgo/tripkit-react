import genStyles from "../css/GenStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";

export const tKUILocationDetailDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%',
        '& .MuiTabs-root': {
            borderBottom: '1px solid ' + black(4)
        },
        '& .MuiTabs-flexContainer': {
            justifyContent: 'space-around'            
        },
        '& .MuiTab-root': {
            textTransform: 'initial'
        },
        '& .Mui-selected': {
            color: theme.colorPrimary
        },
        '& .MuiTabs-indicator': {
            backgroundColor: theme.colorPrimary + '!important'
        }
    },
    details: {
        padding: '40px 0',
        '&>*': {
            marginBottom: '15px',
            paddingLeft: '20px',
            paddingRight: '20px'
        }
    },

    alertsContainer: {
        borderBottom: '1px solid #ECEBEB',
        paddingBottom: '15px',
        '&>*:not(:last-child)': {
            marginBottom: '15px'
        }
    },

    availabilityInfo: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '0 35px 15px 35px',
        ...theme.divider
    },

    availabilityInfoBody: {
        ...genStyles.flex,
        ...genStyles.spaceBetween,
    },

    availabilitySection: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignCenter
    },

    availabilityDivider: {
        borderRight: '1px solid ' + black(4, theme.isDark)
    },

    availabilityLabel: {
        textTransform: 'uppercase',
        ...theme.textWeightBold,
        ...theme.textSizeCaption
    },

    availabilityValueCont: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },

    availabilityImage: {
        width: '24px',
        height: '24px'
    },

    availabilityValue: {
        color: '#0cc3ff',
        marginLeft: '10px'
    },

    availabilityUpdated: {
        ...theme.textSizeCaption,
        ...theme.textColorGray,
        marginTop: '15px'
    },

    fields: {

    }
});