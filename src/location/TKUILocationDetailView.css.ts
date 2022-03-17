import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUILocationDetailViewDefaultStyle = (theme: TKUITheme) => ({
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
});