import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationDetailViewProps, TKUILocationDetailViewStyle} from "./TKUILocationDetailView";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

export const tKUILocationDetailViewDefaultStyle: TKUIStyles<TKUILocationDetailViewStyle, TKUILocationDetailViewProps> = {
    main: {

    },
    actionsPanel: {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gridRowGap: '20px',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            marginTop: '15px'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            marginTop: '10px'
        }
    }
};