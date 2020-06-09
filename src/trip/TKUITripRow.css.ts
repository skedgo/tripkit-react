import {badgeColor, TKUITripRowProps, TKUITripRowStyle} from "./TKUITripRow";
import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {rowSelectedStyle, rowStyle} from "../service/TKUIServiceDepartureRow.css";

export const tTKUITripRowDefaultStyle: TKUIStyles<TKUITripRowStyle, TKUITripRowProps> =
    (theme: TKUITheme) => ({
        main: {
            background: 'white',
            borderTop: '1px solid #ECEBEB',
            borderRight: '1px solid #ECEBEB',
            borderBottom: '1px solid #ECEBEB',
            cursor: 'pointer'
        },
        badge: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.fontM,
            padding: '12px 10px 0',
            fontWeight: 'bold',
            color: (props: TKUITripRowProps) => props.badge && badgeColor(props.badge),
            ...genStyles.svgFillCurrColor,
            '& svg': {
                width: '16px',
                height: '16px',
                marginRight: '10px',
            }
        },
        info: {
            color: tKUIColors.black1,
            ...genStyles.fontS
        },
        trackAndAction: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            marginTop: '10px'
        },
        track: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            whiteSpace: 'nowrap',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            '& > *': {
                marginRight: '3px'
            }
        },
        footer: {
            ...genStyles.flex,
            ...genStyles.spaceBetween,
            padding: '12px 0',
            '& > *': {
                margin: '0 10px'
            }
        },
        alternative: {
            ...rowStyle,
            borderBottom: '1px solid #ECEBEB'
        },
        selectedAlternative: {
            ...rowSelectedStyle(theme)
        },
        pastAlternative: {
            opacity: '.4'
        },
        crossOut: {
            borderTop: '1px solid black',
            position: 'absolute',
            top: '50%',
            width: '100%',
            zIndex: '1'
        }
    });