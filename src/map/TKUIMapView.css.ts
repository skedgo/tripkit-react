import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIMapViewProps, TKUIMapViewStyle} from "./TKUIMapView";
import genStyles from "../css/GenStyle.css";
import {CSSProperties} from "react-jss";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIMapViewDefaultStyle: TKUIStyles<TKUIMapViewStyle, TKUIMapViewProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.grow,
            '& .leaflet-popup-content': {
                margin: '0'
            },
            '& .leaflet-popup-content-wrapper': {
                padding: '0',
                ...genStyles.borderRadius(12)
            }
        } as CSSProperties<TKUIMapViewProps>,
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
                ...genStyles.borderRadius(0)
            },
            '& .leaflet-popup-tip-container': {
                display: 'none'
            }
        } as CSSProperties<TKUIMapViewProps>,
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
            '&:hover': {
                backgroundColor: tKUIColors.black4
            }
        },
        currentLocMarker: {
            zIndex: '1000!important'
        },
        currentLocBtn : {
            ...resetStyles.button,
            position: 'absolute',
            right: '10px',
            bottom: '30px',
            width: '35px',
            height: '35px',
            backgroundColor: 'white',
            // opacity: '.5',
            cursor: 'pointer',
            zIndex: '1000',
            padding: '3px',
            ...genStyles.borderRadius(4),
            ...genStyles.svgFillCurrColor,
            '& svg': {
                color: theme.colorPrimary,
                width: '100%',
                height: '100%'
            }
        },
        resolvingCurrLoc: {
            '& svg': {
                animation: 'colorchange 2s infinite',
                WebkitAnimation: 'colorchange 2s infinite'
            }
        },
        vehicle: {
            ...{display: '-webkit-flex!important'},
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