import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationDetailViewProps, TKUILocationDetailViewStyle} from "./TKUILocationDetailView";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import LocationUtil from "../util/LocationUtil";
import DeviceUtil from "../util/DeviceUtil";
import genStyles from "../css/GenStyle.css";

export const tKUILocationDetailViewDefaultStyle: TKUIStyles<TKUILocationDetailViewStyle, TKUILocationDetailViewProps> = {
    main: {
        padding: '40px 12px',
        '&>*': {
            marginBottom: '25px'
        }
    },
    alertsContainer: {
        borderBottom: '1px solid #ECEBEB',
        '&>*:not(last-child)': {
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
    }
};