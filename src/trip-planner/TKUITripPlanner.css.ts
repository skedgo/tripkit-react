import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "./TKUITripPlanner";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";

export const tKUITripPlannerDefaultStyle: TKUIStyles<TKUITKUITripPlannerStyle, TKUITKUITripPlannerProps> = {
    main: {
        // ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
        //     minHeight: '236px'
        // }
    },
    queryPanel: {
        position: 'absolute',
        width: '450px',
        zIndex: '1001', // 1 above card modal container
        top: '10px',
        left: '10px',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            width: '450px',
            left: '10px'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            width: '100%',
            top: '0',
            left: '0'
        }
    }
};