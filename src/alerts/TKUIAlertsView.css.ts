import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIAlertsViewProps, TKUIAlertsViewStyle} from "./TKUIAlertsView";

export const tKUIAlertsViewDefaultStyle: TKUIStyles<TKUIAlertsViewStyle, TKUIAlertsViewProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '30px 15px',
            '&>*:not(:last-child)': {
                borderBottom: '1px solid ' + tKUIColors.black4,
                paddingBottom: '15px',
                marginBottom: '15px'
            }
        }
    });