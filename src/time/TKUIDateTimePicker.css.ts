import {black, TKUITheme, white} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIDateTimePickerProps, TKUIDateTimePickerStyle} from "./TKUIDateTimePicker";
import genStyles from "../css/GenStyle.css";
import {DeviceUtil, genStylesJSS} from "../index";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIDateTimePickerDefaultStyle: TKUIStyles<TKUIDateTimePickerStyle, TKUIDateTimePickerProps> =
    (theme: TKUITheme) => ({
        datePicker: {
            fontFamily: theme.fontFamily,
            fontSize: '13px',
            ...theme.textColorGray,
            ...resetStyles.input
        },
        calendarPopper: {
            marginTop: '12px!important',
            '& .react-datepicker__triangle': {
                borderBottomColor: white(0, theme.isDark) + '!important'
            },
            '& .react-datepicker__triangle::before': {
                top: '-1px!important'
            },
            zIndex: '100!important'
        },
        calendar: {
            background: white(0, theme.isDark),
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
                borderBottom: '1px solid ' + black(4, theme.isDark)
            },
            '& .react-datepicker__header--time': {
                padding: '12px 0',
                borderBottom: '1px solid ' + black(4, theme.isDark)
            },
            '& li.react-datepicker__time-list-item': {
                whiteSpace: 'nowrap',
                textAlign: 'center',
                padding: '8px 5px !important',
                fontSize: '13px'
            },
            '& .react-datepicker__time-container': {
                borderLeft: '1px solid ' + black(4, theme.isDark)
            },
            '& .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover': {
                backgroundColor: theme.isDark ? white(3) : '#f0f0f0'
            },
            '& .react-datepicker__day.react-datepicker__day--selected, .react-datepicker__day.react-datepicker__day--keyboard-selected, .react-datepicker__day.react-datepicker__day--selected:hover, .react-datepicker__day.react-datepicker__day--keyboard-selected:hover': {
                ...genStyles.borderRadius(50, '%')
            },
            '& .react-datepicker__day.react-datepicker__day--selected, .react-datepicker__day.react-datepicker__day--selected:hover': {
                backgroundColor: theme.colorPrimary,
                color: white(0, theme.isDark)
            },
            '& .react-datepicker__day.react-datepicker__day--keyboard-selected, .react-datepicker__day.react-datepicker__day--keyboard-selected:hover': {
                backgroundColor: black(4),
                color: black(0, theme.isDark)
            },
            '& .react-datepicker__day:hover': {
                ...genStyles.borderRadius(50, '%'),
                backgroundColor: theme.isDark ? white(3) : '#f0f0f0'
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
            },
            '& li.react-datepicker__time-list-item--selected': {
                backgroundColor: theme.colorPrimary + '!important',
                color: white(0, theme.isDark) + '!important'
            },
            '& .react-datepicker-time__input': {
                border: 'none',
                fontFamily: theme.fontFamily,
                background: 'none!important'
            },
            '& *': {
                color: black(0, theme.isDark)
            }
        },
        inputElem: {
            ...DeviceUtil.isPhone ? genStylesJSS.fontM : genStylesJSS.fontS,
            ...resetStyles.input,
            ...theme.textColorGray
        },
        face: {
            '& input': {
                background: 'none',
                border: 'none',
            }
        },
        faceHidden: {
            height: 0,
            '& input': {
                position: 'absolute',
                zIndex: '-1',
                height: '0',
                width: '0'
            }
        },
        timePicker: {
            '& select': {
                appearance: 'none'
            },
            '& .react-time-picker__wrapper': {
                border: 'none'
            }
        }
    });