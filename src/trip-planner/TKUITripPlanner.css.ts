import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "./TKUITripPlanner";

export const tKUITripPlannerDefaultStyle: TKUIStyles<TKUITKUITripPlannerStyle, TKUITKUITripPlannerProps> = {
    queryPanel: {
        position: 'absolute',
        width: '450px',
        zIndex: '1001', // 1 above card modal container
        top: '10px',
        left: '10px'
    }
};