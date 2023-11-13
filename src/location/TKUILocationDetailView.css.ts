import genStyles from "../css/GenStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";
import DeviceUtil from "../util/DeviceUtil";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

export const tKUILocationDetailViewDefaultStyle = (theme: TKUITheme) => ({
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
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            padding: '24px 0'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            padding: '10px 0'
        },
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

    },
    actionsPanel: {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gridRowGap: '20px',
        borderBottom: '1px solid rgba(33, 42, 51, 0.12)',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            padding: '0 16px 16px 16px',
            marginBottom: '24px'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            padding: '0 0 16px',
            marginBottom: '30px'
        },
        ...DeviceUtil.isIE && {
            ...genStyles.flex,
            ...genStyles.spaceAround
        }
    },
    vehicleName: {
        color: '#47ade3',
        marginLeft: '10px'
    }
});