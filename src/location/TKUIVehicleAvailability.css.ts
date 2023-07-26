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
        ...genStyles.flex,
        borderTop: '1px solid ' + black(4)
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
        height: '60px'
    },
    timeIndex: {
        ...genStyles.noShrink,
        position: 'relative',
        fontSize: '14px'
    },
    dayIndex: {
        position: 'absolute',
        top: '19px',
        ...theme.textColorGray,
        fontSize: '13px'
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
    vehicleName: {
        ...genStyles.overflowEllipsis
    },
    selectionPanel: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        position: 'absolute',
        left: 0,
        width: '100%',
        ...genStyles.spaceBetween
    },
    whiteToTransparent: {
        background: 'linear-gradient(to right, white, #ffffff00)'
    },
    transparentToWhite: {
        background: 'linear-gradient(to left, white, #ffffff00)'
    },
    slots: {
        ...genStyles.flex,
        ...genStyles.alignCenter
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
        height: '60px',
        ...genStyles.noShrink,
        // position: 'absolute',
        // background: 'white',
        '& svg': {
            width: '12px',
            height: '12px'
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
    fromTo: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>div:first-child': {
            ...theme.textWeightSemibold,
            marginBottom: '5px'
        }
    },
    placeholder: {
        ...theme.textColorGray
    },
    buttons: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '&>*:first-child': {
            marginRight: '25px'
        }
    }
});