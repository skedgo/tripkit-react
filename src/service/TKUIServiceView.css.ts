import {TKUIStyles} from "../jss/StyleHelper";
import {ITKUIServiceViewProps, ITKUIServiceViewStyle} from "./TKUIServiceView";
import {tKUIColors} from "../jss/TKStyleProvider";
import genStyles from "../css/GenStyle.css";

export const tKUIServiceViewDefaultStyle: TKUIStyles<ITKUIServiceViewStyle, ITKUIServiceViewProps> = {
    main: {
        height: '100%',
        ...genStyles.flex,
        ...genStyles.column
    },
    serviceOverview: {
        margin: '10px 0'
    },
    pastStop: {
        '& div': {
            color: tKUIColors.black2
        }
    },
    currStop: {

    },
    currStopMarker: {
        padding: '8px',
        backgroundColor: tKUIColors.white,
        boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
        ...genStyles.borderRadius(50, "%")
    }
};