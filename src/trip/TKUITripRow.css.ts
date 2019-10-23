import {badgeColor, ITKUITripRowProps, ITKUITripRowStyle} from "./TKUITripRow";
import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors} from "../jss/TKStyleProvider";
import genStyles from "../css/GenStyle.css";

export const tTKUITripRowDefaultStyle: TKUIStyles<ITKUITripRowStyle, ITKUITripRowProps> = {
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
        color: (props: ITKUITripRowProps) => props.badge && badgeColor(props.badge),
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
        borderTop: '1px solid #ECEBEB',
        padding: '12px 0',
        '& > *': {
            margin: '0 10px'
        }
    }
};