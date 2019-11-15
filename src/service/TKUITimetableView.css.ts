import genStyles from "../css/GenStyle.css";
import {ITKUITimetableViewStyle} from "./TKUITimetableView";
import {resetStyles} from "../css/ResetStyle.css";
import {tKUIColors} from "../jss/TKUITheme";

// TODO: apply this
// .device-phone .ServiceDepartureTable-filterInput {
//   font-size: 16px;
// }

export const tKUITimetableDefaultStyle: ITKUITimetableViewStyle = {
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
        }
    },
    subHeader: {
        ...genStyles.flex,
        ...genStyles.column
    },
    serviceList: {
        marginTop: '8px',
        minHeight: '20px',
        overflowX: 'hidden',
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    serviceNumber: {
        color: 'white',
        borderRadius: '4px',
        padding: '2px 4px',
        marginLeft: '4px',
        ...genStyles.fontSM
    },
    buttonsPanel: {
        marginTop: '16px',
        '&>*': {
            ...genStyles.grow
        },
        '&>*:first-child': {
            marginRight: '8px'
        }
    },
    secondaryBar: {
        padding: '8px 16px',
        backgroundColor: '#e6eff2',
        borderBottom: '1px solid ' + tKUIColors.black4,
        ...genStyles.flex,
        ...genStyles.alignCenter,
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
        ...genStyles.fontS,
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
        }
    },
    dapartureRow: {
        padding: '20px 16px',
        borderBottom: '1px solid ' + tKUIColors.black4
    }
};