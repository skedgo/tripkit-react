import genStyles, { keyFramesStyles } from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
import { black, TKUITheme } from "../jss/TKUITheme";

export const tKUIVehicleAvailabilityDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    scrollXPanel: {
        overflowX: 'scroll',
    },
    scrollYPanel: {
        paddingLeft: 0,
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        flexGrow: 1,
        height: '1px'
    },
    header: {
        ...genStyles.flex,
        borderBottom: '1px solid #212a331f'
    },
    datePicker: {
        ...genStyles.flex,
        ...genStyles.justifyStart,
        ...genStyles.alignCenter,
        ...genStyles.grow,
        marginLeft: '25px'
    },
    datePickerInput: {
        ...resetStyles.button,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '& svg': {
            marginRight: '10px'
        }
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
        ...genStyles.column,
        width: '100%'
    },
    vehicle: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '20px 0',
        borderBottom: '1px solid ' + black(4)
    },
    fadeVehicle: {
        opacity: '.5'
    },
    vehicleLabel: {
        ...genStyles.flex,
        ...genStyles.noShrink,
        ...genStyles.alignCenter,
        whiteSpace: 'nowrap',
        position: 'absolute',
        left: 0,
        background: 'white'
    },
    vehicleIcon: {
        width: '40px',
        height: '40px',
        background: '#00000014',
        ...genStyles.borderRadius(50, "%"),
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.noShrink,
        marginLeft: '15px'
    },
    vehicleName: {
        ...genStyles.overflowEllipsis,
        padding: '15px 0 15px 12px', flexGrow: 1
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
        ...genStyles.noShrink,
        ...genStyles.flex,
        '&>*': {
            ...genStyles.grow,
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.center
        }
    },
    selectedSlot: {
        background: black(),
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
        position: 'absolute',
        zIndex: 1,
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
    arrowLeftIconContainer: {
        ...genStyles.grow,
        background: 'white',
        padding: '24px 0 24px 14px',
        height: '100%'
    },
    arrowRightIconContainer: {
        ...genStyles.grow,
        background: 'white',
        padding: '24px 14px 24px 0',
        height: '100%'
    },
    fromTo: {
        ...genStyles.flex,
        ...genStyles.column,
        marginRight: '10px',
        '&>div:first-child': {
            ...theme.textWeightSemibold,
            marginBottom: '5px'
        },
        '&>div:last-child': {
            whiteSpace: 'wrap'
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
    },
    iconLoading: {
        margin: '5px',
        width: '20px',
        height: '20px',
        color: black(1, theme.isDark),
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    },
    noVehicles: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.center,
        ...theme.textColorGray
    }
});