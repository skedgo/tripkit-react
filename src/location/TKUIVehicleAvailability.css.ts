import genStyles from "../css/GenStyle.css";
import {black, TKUITheme} from "../jss/TKUITheme";
import { tKUIDateTimePickerDefaultStyle } from "../time/TKUIDateTimePicker.css";

export const tKUIVehicleAvailabilityDefaultStyle = (theme: TKUITheme) => ({
    main: {
        paddingTop: '10px',        
        '&>*': {
            marginBottom: '15px',
            paddingLeft: '20px',
            paddingRight: '20px'
        }
    },
    calendar: {
        ...tKUIDateTimePickerDefaultStyle(theme).calendar,
        '&.react-datepicker': {
            border: 'none',
            width: '100%'
        },
        '& .react-datepicker__month-container': {
            float: 'none'
        },
        '& .react-datepicker__day-names, .react-datepicker__week': {
            ...genStyles.flex,
            ...genStyles.spaceBetween
        },
        '& .react-datepicker__day--outside-month': {
            color: black(2, theme.isDark) + '!important'
        }
    }
});