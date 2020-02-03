import {TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIDateTimePickerProps, TKUIDateTimePickerStyle} from "./TKUIDateTimePicker";
import genStyles from "../css/GenStyle.css";

export const tKUIDateTimePickerDefaultStyle: TKUIStyles<TKUIDateTimePickerStyle, TKUIDateTimePickerProps> =
    (theme: TKUITheme) => ({
        calendarPopper: {
            left: '5px!important',
            marginTop: '12px!important',
            '& .react-datepicker__triangle': {
                borderBottomColor: 'white!important'
            },
            '& .react-datepicker__triangle::before': {
                top: '-1px!important'
            }
        },
        calendar: {
            '&.react-datepicker': {
                border: 'none',
                ...genStyles.borderRadius(12),
                boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important'
            },
            '& ul': {
                padding: '0'
            },
            '& .react-datepicker__header': {
                paddingTop: '0',
                background: 'none',
                borderBottom: 'none'
            },
            '& .react-datepicker__time': {
                background: 'none!important'
            },
            '& .react-datepicker__current-month': {
                padding: '12px 0',
                borderBottom: '1px solid #cbcbcb'
            },
            '& .react-datepicker__header--time': {
                padding: '12px 0',
                borderBottom: '1px solid #cbcbcb'
            },
            '& li.react-datepicker__time-list-item': {
                whiteSpace: 'nowrap',
                textAlign: 'center',
                padding: '8px 5px !important'
            },
            '& .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected, .react-datepicker__day--selected:hover, .react-datepicker__day--keyboard-selected:hover': {
                backgroundColor: theme.colorPrimary,
                ...genStyles.borderRadius(50, '%')
            },
            '& .react-datepicker__day:hover': {
                ...genStyles.borderRadius(50, '%')
            },
            '& button.react-datepicker__navigation': {
                top: '14px',
                border: '.40rem solid transparent'
            },
            '& button.react-datepicker__navigation--next': {
                borderLeftColor: theme.colorPrimary
            },
            '& button.react-datepicker__navigation--previous': {
                borderRightColor: theme.colorPrimary
            }
        }
    });