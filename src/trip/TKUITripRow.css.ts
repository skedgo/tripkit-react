import {badgeColor, TKUITripRowProps, ITKUITripRowStyle} from "./TKUITripRow";
import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tTKUITripRowDefaultStyle: TKUIStyles<ITKUITripRowStyle, TKUITripRowProps> =
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
            padding: '12px 10px',
            borderBottom: '1px solid #ECEBEB',
        },
        selectedAlternative: {
            borderLeft: '3px solid ' + theme.colorPrimary,
            paddingLeft: '7px!important'
        }
    });