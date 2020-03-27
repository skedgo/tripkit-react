import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationDetailViewProps, TKUILocationDetailViewStyle} from "./TKUILocationDetailView";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import LocationUtil from "../util/LocationUtil";

export const tKUILocationDetailViewDefaultStyle: TKUIStyles<TKUILocationDetailViewStyle, TKUILocationDetailViewProps> = {
    main: {
        padding: '40px 12px'
    },
    actionsPanel: {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gridRowGap: '20px',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            marginTop: '15px'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            marginTop: (props: TKUILocationDetailViewProps) => // More margin (30px) to compensate there is no subtitle,
                LocationUtil.getSecondaryText(props.location) ? '10px' : '30px' // looks better when card is at bottom position.
        }
    }
};