import genStyles from "../css/GenStyle.css";
import {TKUITimetableViewProps, TKUITimetableViewStyle} from "./TKUITimetableView";
import {resetStyles} from "../css/ResetStyle.css";
import {tKUIColors} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {CSSProperties} from "react-jss";
import DeviceUtil from "../util/DeviceUtil";

export const tKUITimetableDefaultStyle: TKUIStyles<TKUITimetableViewStyle, TKUITimetableViewProps> = {
    main: {
        height: '100%',
        ...genStyles.flex,
        ...genStyles.column
    },
    listPanel: {
        ...genStyles.scrollableY,
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        ...genStyles.relative,
        '&>*': {
            borderBottom: '1px solid lightgray;'
        }
    },
    containerPanel: {
        ...genStyles.scrollableY,
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        '&>*': {
            ...genStyles.noShrink
        } as CSSProperties<TKUITimetableViewProps>
    },
    subHeader: {
        ...genStyles.flex,
        ...genStyles.column
    },
    serviceList: {
        minHeight: '20px',
        overflowX: 'hidden',
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.wrap
    },
    serviceNumber: {
        color: 'white',
        borderRadius: '4px',
        padding: '2px 4px',
        marginRight: '4px',
        marginTop: '8px',
        ...genStyles.fontSM
    },
    actionsPanel: {
        marginTop: '15px',
        ...genStyles.flex,
        '&>*': {
            ...genStyles.grow
        } as CSSProperties<TKUITimetableViewProps>,
        '&>*:first-child': {
            marginRight: '10px'
        }
    },
    secondaryBar: {
        padding: '8px 16px',
        backgroundColor: '#e6eff2',
        borderBottom: '1px solid ' + tKUIColors.black4,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.noShrink,
        '@global .react-datepicker__triangle': {
            left: 'initial',
            right: '22px'
        }
    },
    filterPanel: {
        backgroundColor: 'white',
        border: '1px solid ' + tKUIColors.black3,
        ...genStyles.borderRadius(8),
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.grow
    },
    glassIcon: {
        height: '12px',
        width: '12px',
        margin: '0 7px',
        color: '#B3ADAD',
        ...genStyles.svgFillCurrColor
    },
    filterInput: {
        border: 'none!important',
        boxShadow: 'none!important',
        background: 'none!important',
        color: tKUIColors.black1,
        height: '30px',
        ...DeviceUtil.isPhone ? genStyles.fontM : genStyles.fontS,
        ...genStyles.grow,
        '&::placeholder': {
            color: tKUIColors.black2
        }
    },
    faceButtonClass: {
        ...resetStyles.button,
        ...genStyles.flex,
        ...genStyles.alignCenter,
        marginLeft: '16px',
        '& svg': {
            width: '24px',
            height: '24px',
            color: tKUIColors.black1,
            ...genStyles.svgPathFillCurrColor
        } as CSSProperties<TKUITimetableViewProps>
    },
    dapartureRow: {
        borderBottom: '1px solid ' + tKUIColors.black4
    },
    iconLoading: {
        margin: '10px',
        width: '20px',
        height: '20px',
        color: '#6d6d6d',
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    }
};