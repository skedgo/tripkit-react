import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIMyLocationMapIconProps, TKUIMyLocationMapIconStyle} from "./TKUIMyLocationMapIcon";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIMyLocationMarkerDefaultStyle: TKUIStyles<TKUIMyLocationMapIconStyle, TKUIMyLocationMapIconProps> =
    (theme: TKUITheme) => ({
        main: {
            width: '100px',
            height: '100px',
            display: 'block',
            WebkitTransform: 'translate(-40px, -40px)',
            MozTransform: 'translate(-40px, -40px)',
            MsTransform: 'translate(-40px, -40px)',
            OTransform: 'translate(-40px, -40px)',
            Transform: 'translate(-40px, -40px)'
        },
        pin: {
            width: '20px',
            height: '20px',
            position: 'relative',
            top: '40px',
            left: '40px',
            background: theme.colorPrimary,
            boxSizing: 'border-box',
            border: '3px solid #FFF',
            zIndex: '1001',
            animation: 'beat 2400ms ease-out infinite',
            ...genStyles.borderRadius(50, '%')
        },
        pinEffect: {
            width: '100px',
            height: '100px',
            position: 'absolute',
            top: '0',
            display: 'block',
            background: theme.colorPrimary,
            opacity: '0',
            ...genStyles.borderRadius(50, '%')
        }
    });