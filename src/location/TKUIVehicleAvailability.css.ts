import genStyles, { keyFramesStyles } from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
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
    datePicker: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.grow
    },
    datePickerInput: {
        ...resetStyles.button
    },
    timeIndexes: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        height: '40px'
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
    fadeVehicle: {
        opacity: '.5'
    },
    vehicleLabel: {
        ...genStyles.flex,
        ...genStyles.noShrink,
        whiteSpace: 'nowrap',
        // Scroll scheme
        position: 'absolute',
        // height: '24px',
        left: 0,
        '&>*:first-child': {
            background: 'white'
        }
    },
    whiteToTransparent: {
        background: 'linear-gradient(to right, white, #ffffff00)'
    },
    transparentToWhite: {
        background: 'linear-gradient(to left, white, #ffffff00)'
    },
    slot: {
        height: '24px',
        ...genStyles.noShrink,
        ...genStyles.flex,
        '&>*': {
            ...genStyles.grow
        }
    },
    selectedSlot: {
        background: black(),
        height: '24px',
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter
    },
    firstSlot: {
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
    },
    lastSlot: {
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px'
    },
    firstSelectedSlot: {
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
    },
    lastSelectedSlot: {
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px'
    },
    availableSlot: {
        background: '#4DEF9E',
        borderLeft: '1px solid white',
        borderRight: '1px solid white',
        '&:hover': {
            background: '#44c786', // TODO: pick exact color from Figma
        }
    },
    unavailableSlot: {
        background: '#00000014',
        borderLeft: '1px solid white',
        borderRight: '1px solid white',
    },
    loadingSlot: {
        animation: keyFramesStyles.keyframes.beatBackground + ' 4s cubic-bezier(1,1,1,1) infinite'
    },
    arrowBtn: {
        ...resetStyles.button,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.center,
        height: '40px',
        ...genStyles.noShrink,
        // position: 'absolute',
        // background: 'white',
        '& svg': {
            width: '100%',
            height: '100%'
        },
        '& path': {
            fill: black(0, theme.isDark)
        },
        '&:hover path': {
            fill: black(1, theme.isDark)
        },
        '&:disabled path': {
            fill: black(2, theme.isDark)
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