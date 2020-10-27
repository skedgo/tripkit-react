import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUIMapLocationPopupDefaultStyle =
    (theme: TKUITheme) => {
        return ({
            info: {
                ...genStyles.flex,
                ...genStyles.column
            },
            infoRow: {
                ...genStyles.flex,
                ...genStyles.alignCenter
            },
            infoRowImage: {
                width: '24px',
                height: '24px'
            },
            infoRowLabel: {
                ...genStyles.grow,
                margin: '10px 15px'
            },
            infoRowValue: {
                ...theme.textColorDefault
            }
        })
    };