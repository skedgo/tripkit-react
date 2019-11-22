import {TKUIStyles} from "../../jss/StyleHelper";
import {TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle} from "./TKUITrainOccupancyInfo";
import {TKUITheme} from "../../jss/TKUITheme";
import genStyles from "../../css/GenStyle.css";

export const tKUITrainOccupancyInfoDefaultStyle: TKUIStyles<TKUITrainOccupancyInfoStyle, TKUITrainOccupancyInfoProps> =
    (theme: TKUITheme) => ({
        icon: {
            ...genStyles.svgFillCurrColor
        },
        empty: {
            color: theme.colorSuccess
        },
        manySeatsAvailable: {
            color: theme.colorSuccess
        },
        fewSeatsAvailable: {
            color: theme.colorWarning
        },
        standingRoomOnly: {
            color: theme.colorWarning
        },
        crushedStandingRoomOnly: {
            color: theme.colorWarning
        },
        full: {
            color: theme.colorError
        },
        notAcceptingPassengers: {
            color: theme.colorError
        }
    });