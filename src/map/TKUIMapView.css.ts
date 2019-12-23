import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIMapViewProps, TKUIMapViewStyle} from "./TKUIMapView";
import genStyles from "../css/GenStyle.css";
import {CSSProperties} from "react-jss";
import {tKUIColors} from "../jss/TKUITheme";

export const tKUIMapViewDefaultStyle: TKUIStyles<TKUIMapViewStyle, TKUIMapViewProps> = {
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
    menuPopup: {
        // left: '0!important',
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
    }
};