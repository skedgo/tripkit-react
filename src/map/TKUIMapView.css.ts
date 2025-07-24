import { TKUIMapViewProps } from "./TKUIMapView";
import genStyles from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";
import { resetStyles } from "../css/ResetStyle.css";

export const tKUIMapViewDefaultStyle = (theme: TKUITheme) => ({
    main: {
        position: 'relative',
        zIndex: '0',
        height: '100%',
        ...genStyles.flex,
        ...genStyles.grow,
        '& .leaflet-container': {
            background: theme.isLight ? '#ddd' : black(0)
        },
        '& .leaflet-popup-content': {
            margin: '0'
        },
        '& .leaflet-popup-content-wrapper': {
            padding: '0',
            ...theme.cardBackground,
            ...theme.textColorGray
        },
        '& .leaflet-popup-tip': {
            background: white(0, theme.isDark)
        },
        '& .leaflet-bar': {
            boxShadow: 'none',
            ...theme.cardBackground,
            borderRadius: '4px'
        },
        '& .leaflet-bar a:first-child': {
            ...theme.divider
        },
        '& .leaflet-bar a, .leaflet-bar a:hover': {
            background: 'none!important',
            color: black(1, theme.isDark)
        }
    } as any,
    leaflet: {
        ...genStyles.flex,
        ...genStyles.grow,
        overflowY: 'hidden!important',
        padding: '0',
        WebkitUserSelect: 'none', /* Safari 3.1+ */
        MozUserSelect: 'none', /* Firefox 2+ */
        MsUserSelect: 'none', /* IE 10+ */
        userSelect: 'none' /* Standard syntax */
    },
    menuPopup: {
        '& .leaflet-popup-content': {
            margin: '0'
        },
        '& .leaflet-popup-content-wrapper': {
            padding: '0',
            ...theme.cardBackground,
            ...genStyles.borderRadius(4),
        },
        '& .leaflet-popup-tip-container': {
            display: 'none'
        }
    } as any,
    menuPopupBelow: {
        top: '0'
    },
    menuPopupAbove: {
        bottom: '0'
    },
    menuPopupLeft: {
        right: '0',
        left: 'initial!important'
    },
    menuPopupRight: {
        left: '0!important'
    },
    menuPopupContent: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '5px 0'
    },
    menuPopupItem: {
        padding: '5px 10px',
        cursor: 'pointer',
        color: black(1, theme.isDark),
        '&:hover': {
            backgroundColor: black(4, theme.isDark)
        }
    },
    currentLocMarker: {
        zIndex: '1000!important'
    },
    currentLocBtn: {
        ...resetStyles.button,
        position: 'absolute',
        right: '10px',
        width: '35px',
        height: '35px',
        ...theme.cardBackground,
        ...genStyles.borderRadius(4),
        cursor: 'pointer',
        zIndex: '1000',
        padding: '3px',
        ...genStyles.svgFillCurrColor,
        '& svg': {
            color: theme.colorPrimary,
            width: '100%',
            height: '100%'
        },
        // TODO: replaced next props by two separate classes below until making
        // a props update refresh injected css. See comment in StyleHelper.onRefreshStyles
        // bottom: (props: TKUIMapViewProps) => props.landscape ? '30px' : undefined,
        // top: (props: TKUIMapViewProps) => props.portrait ? (props.directionsView ? '83px' : '68px') : undefined,
    },
    currentLocBtnLandscape: {
        bottom: '30px',
        top: undefined,
    },
    currentLocBtnPortrait: {
        bottom: undefined,
        top: (props: TKUIMapViewProps) => props.mapClickBehaviour === "SET_FROM_TO" ? '83px' : '68px', // Replaced props.directionsView in condition. Avoid this
    },
    resolvingCurrLoc: {
        '& svg': {
            animation: 'colorchange 2s infinite',
            WebkitAnimation: 'colorchange 2s infinite'
        }
    },
    vehicle: {
        ...{ display: '-webkit-flex!important' },
        display: 'flex!important',
        ...genStyles.alignCenter,
        zIndex: '1000!important'
    },
    segmentIconClassName: {
        zIndex: '1002!important',
        outline: 'none!important',
        '& div': {
            outline: 'none!important'
        }
    },
    vehicleClassName: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        zIndex: '1000!important'
    }
});