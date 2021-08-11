import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIServiceViewProps, TKUIServiceViewStyle} from "./TKUIServiceView";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIServiceViewDefaultStyle: TKUIStyles<TKUIServiceViewStyle, TKUIServiceViewProps> =
    (theme: TKUITheme) => ({
        main: {
            height: '100%',
            ...genStyles.flex,
            ...genStyles.column
        },
        serviceOverview: {
            ...genStyles.flex,
            ...genStyles.column
        },
        pastStop: {
            '& div': {
                ...theme.textColorDisabled
            }
        },
        currStop: {

        },
        currStopMarker: {
            padding: '8px',
            backgroundColor: tKUIColors.white,
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            ...genStyles.borderRadius(50, "%")
        },
        actionsPanel: {
            margin: '24px 0 16px',
            ...genStyles.flex,
            ...genStyles.spaceAround
        }
    });