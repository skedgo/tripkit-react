import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";
import genStyles from "../css/GenStyle.css";
import {black, TKUITheme} from "../jss/TKUITheme";

export const tKUILocationDetailViewDefaultStyle = (theme: TKUITheme) => ({
    main: {
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

    actionsPanel: {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gridRowGap: '20px',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            margin: '24px 0 16px'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            margin: '10px 0 16px'
        },
        ...DeviceUtil.isIE && {
            ...genStyles.flex,
            ...genStyles.spaceAround
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