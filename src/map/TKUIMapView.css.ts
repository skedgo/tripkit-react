import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIMapViewProps, TKUIMapViewStyle} from "./TKUIMapView";
import genStyles from "../css/GenStyle.css";
import {CSSProperties} from "react-jss";
import {black, tKUIColors, TKUITheme, white} from "../jss/TKUITheme";
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
            },
            '& .leaflet-bar': {
                boxShadow: theme.isLight ?
                    '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
                    '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)'
            },
            '& .leaflet-bar a:first-child': {
                ...theme.divider
            },
            '& .leaflet-bar a, .leaflet-bar a:hover': {
                backgroundColor: white(0, theme.isDark),
                color: black(1, theme.isDark)
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
                ...genStyles.borderRadius(0),
                background: 'none'
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
            padding: '5px 0',
            background: white(0, theme.isDark),
            boxShadow: theme.isLight ?
                '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
                '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)',
            ...genStyles.borderRadius(4)
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
        currentLocBtn : {
            ...resetStyles.button,
            position: 'absolute',
            right: '10px',
            width: '35px',
            height: '35px',
            background: white(0, theme.isDark),
            boxShadow: theme.isLight ?
                '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
                '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)',
            cursor: 'pointer',
            zIndex: '1000',
            padding: '3px',
            ...genStyles.borderRadius(4),
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
            top: (props: TKUIMapViewProps) => props.directionsView ? '83px' : '68px',
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