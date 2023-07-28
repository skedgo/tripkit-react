import { black, important, TKUITheme, white } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
import DeviceUtil from "../util/DeviceUtil";

export const tKUIDateTimePickerDefaultStyle = (theme: TKUITheme) => ({
    datePicker: {
        ...resetStyles.input,
        ...resetStyles.button,
        fontFamily: theme.fontFamily,
        fontSize: '13px',
        ...theme.textColorGray
    },
    calendarPopper: {
        paddingTop: '12px!important',
        '& .react-datepicker__triangle': {
            borderBottomColor: white(0, theme.isDark) + '!important'
        },
        '& .react-datepicker__triangle::after': {
            borderBottomColor: white(0, theme.isDark) + '!important'
        },
        zIndex: '100!important'
    },
    calendar: {
        backgroundColor: white(0, theme.isDark) + "!important",
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
            color: white(0, theme.isDark) + '!important'
        },
        '& .react-datepicker__day.react-datepicker__day--keyboard-selected, .react-datepicker__day.react-datepicker__day--keyboard-selected:hover': {
            backgroundColor: black(4),
            color: black(0, theme.isDark) + '!important'
        },
        '& .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected)': {
            ...genStyles.borderRadius(50, '%'),
            backgroundColor: theme.isDark ? white(3) : '#f0f0f0'
        },
        '& button.react-datepicker__navigation': {
            top: '15px',
            border: '.40rem solid transparent',
            width: '12px',
            height: '12px'
        },
        '& button.react-datepicker__navigation--next': {
            borderLeftColor: theme.colorPrimary,
            right: '10px'
        },
        '& button.react-datepicker__navigation--previous': {
            borderRightColor: theme.colorPrimary,
            left: '10px'
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
            ...important(theme.textColorDefault)
        },
        '& .react-datepicker__day--disabled': {
            color: black(1, theme.isDark) + '!important'
        }
    },
    inputElem: {
        ...DeviceUtil.isPhone ? genStyles.fontM : genStyles.fontS,
        ...resetStyles.input,
        ...theme.textColorGray,
        width: 'initial'   // Since Chrome on android sets an arbitrary width.
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
            width: '0',
            padding: 0  // For Safari on iOS
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