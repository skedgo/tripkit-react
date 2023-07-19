import genStyles from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";
import { tKUIDateTimePickerDefaultStyle } from "../time/TKUIDateTimePicker.css";

export const tKUIVehicleAvailabilityDefaultStyle = (theme: TKUITheme) => ({
    main: {
        paddingTop: '10px',
        '&>*': {
            marginBottom: '15px',
            paddingLeft: '20px',
            paddingRight: '20px'
        },
        // Scroll scheme
        position: 'relative'
    },
    scrollPanel: {
        // Scroll scheme
        overflowX: 'scroll',
    },
    header: {
        ...genStyles.flex
    },        
    timeIndexes: {
        ...genStyles.flex,
        height: '20px'
    },
    timeIndex: {
        ...genStyles.noShrink
    },
    vehicles: {
        ...genStyles.flex,
        ...genStyles.column
    },
    vehicle: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '15px 0',
        borderTop: '1px solid ' + black(4)
    },
    vehicleLabel: {
        ...genStyles.flex,
        ...genStyles.noShrink,
        whiteSpace: 'nowrap',
        // Scroll scheme
        position: 'absolute',
        height: '24px',
        left: 0,
        '&>*:first-child': {
            background: 'white'
        }
    },
    gradient: {
        background: 'linear-gradient(to right, white, #ffffff00)'
    },
    slot: {
        background: '#00000014',
        height: '24px',
        borderLeft: '1px solid white',
        borderRight: '1px solid white',
        ...genStyles.noShrink
    },
    slotAvailable: {
        background: '#4DEF9E'
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