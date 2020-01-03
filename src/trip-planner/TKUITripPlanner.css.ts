import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "./TKUITripPlanner";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUITripPlannerDefaultStyle: TKUIStyles<TKUITKUITripPlannerStyle, TKUITKUITripPlannerProps> =
    (theme: TKUITheme) => ({
        main: {
            // ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            //     minHeight: '236px'
            // }
        },
        queryPanel: {
            position: 'absolute',
            width: '450px',
            top: '10px',
            left: '10px',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                width: '450px',
                left: '10px',
                zIndex: '1005' // above card modal container
            },
            ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
                width: '100%',
                top: '0',
                left: '0',
                padding: '5px 5px 0 5px',
                zIndex: '1001' // below card modal container
            }
        }
    });