import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITripOverviewViewProps, TKUITripOverviewViewStyle} from "./TKUITripOverviewView";
import genStyles from "../css/GenStyle.css";

export const tKUITripOverviewViewDefaultStyle: TKUIStyles<TKUITripOverviewViewStyle, TKUITripOverviewViewProps> = {
    main: {
        padding: '15px 0'
    },
    actionsPanel: {
        marginTop: '15px',
        ...genStyles.flex,
        ...genStyles.spaceAround
    }
};