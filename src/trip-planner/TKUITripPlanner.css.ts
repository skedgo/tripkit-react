import {TKUIStyles} from "../jss/StyleHelper";
import {IProps, ITKUITripPlannerStyle} from "./TKUITripPlanner";

export const tKUITripPlannerDefaultStyle: TKUIStyles<ITKUITripPlannerStyle, IProps> = {
    queryPanel: {
        position: 'absolute',
        width: '450px',
        zIndex: '1001', // 1 above card modal container
        top: '10px',
        left: '10px'
    }
};