import genStyles, { keyFramesStyles } from "../css/GenStyle.css";
import { resetStyles } from "../css/ResetStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";

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
    dayIndexPortrait: {
        position: 'absolute',
        top: '43px',
        color: black(0),
        fontSize: '13px',
        paddingLeft: '8px',
        borderLeft: '1px solid ' + black(2)
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
    availableVehicle: {
        cursor: 'pointer',
        '& $selectedSlot': {
            background: 'rgb(132 190 161)'
        },
        '& $firstSelectedSlot:hover, $lastSelectedSlot:hover': {
            opacity: 1
        }
    },
    fadeVehicle: {
        opacity: '.5'
    },
    unselectedVehicle: {
        '& $availableSlot, $unavailableSlot': {
            borderLeft: 'none',
            borderRight: 'none'
        },
        '& $availableSlot:hover': {
            background: 'rgb(77 239 158)!important'
        }
    },
    vehicleLabel: {
        ...genStyles.flex,
        ...genStyles.noShrink,
        ...genStyles.alignCenter,
        whiteSpace: 'nowrap',
        position: 'absolute',
        left: 0,
        background: white(0, theme.isDark)
    },
    vehicleIcon: {
        width: '40px',
        height: '40px',
        background: black(4, theme.isDark),
        ...genStyles.borderRadius(50, "%"),
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.noShrink,
        marginLeft: '15px',
        '& path': {
            fill: black(0, theme.isDark)
        }
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
        background: `linear-gradient(to right, ${white(0, theme.isDark)}, #ffffff00)`
    },
    transparentToWhite: {
        background: `linear-gradient(to left, ${white(0, theme.isDark)}, #ffffff00)`
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
        background: black(0, theme.isDark),
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        '& path': {
            fill: white(0, theme.isDark)
        }
    },
    firstSlot: {
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
    },
    lastSlot: {
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px'
    },
    fadeSlot: {
        // opacity: '.5' // Cannot do this since it causes issues on overlapping (zIndex). Applied transparency to available / unavailable colours instead.
    },
    firstSelectedSlot: {
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px',
        '&:hover': {
            opacity: .5
        }
    },
    lastSelectedSlot: {
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
        '&:hover': {
            opacity: .5
        }
    },
    availableSlot: {
        background: 'rgb(77 239 158)',
        borderLeft: '1px solid white',
        borderRight: '1px solid white',
        '&:not($fadeSlot):hover': {
            background: '#44c786'
        },
        '&$fadeSlot': {
            background: 'rgb(77 239 158 / 50%)'
        },
        '& svg': {
            display: 'none'
        }
    },
    unavailableSlot: {
        background: black(4, theme.isDark),
        borderLeft: '1px solid white',
        borderRight: '1px solid white',
        '&$fadeSlot': {
            background: black(5, theme.isDark)
        }
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
        background: white(0, theme.isDark),
        padding: '24px 0 24px 14px',
        height: '100%'
    },
    arrowRightIconContainer: {
        ...genStyles.grow,
        background: white(0, theme.isDark),
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
    },
    slotTime: {

    },
    startPreview: {
        '&:hover': {
            background: black(1, theme.isDark) + "!important",
            borderRadius: '8px'
        },
        '&:hover $slotTime': {
            display: 'none'
        },
        '&:hover svg': {
            display: 'block'
        },
        '&:hover path': {
            fill: white(0, theme.isDark)
        }
    },
    endPreview: {
        '&:hover': {
            background: black(1, theme.isDark) + "!important",
            borderRadius: '8px'
        },
        '&:hover $slotTime': {
            display: 'none'
        },
        '&:hover svg': {
            display: 'block'
        },
        '&:hover path': {
            fill: white(0, theme.isDark)
        }
    },
    buttonsPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        padding: '10px',
        borderTop: '1px solid ' + black(4, theme.isDark),
        '&>*:not(:first-child)': {
            marginLeft: '30px'
        }
    }
});