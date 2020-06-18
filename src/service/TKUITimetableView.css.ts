import genStyles from "../css/GenStyle.css";
import {TKUITimetableViewProps, TKUITimetableViewStyle} from "./TKUITimetableView";
import {resetStyles} from "../css/ResetStyle.css";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {CSSProperties} from "react-jss";
import DeviceUtil from "../util/DeviceUtil";

export const tKUITimetableDefaultStyle: TKUIStyles<TKUITimetableViewStyle, TKUITimetableViewProps> =
    (theme: TKUITheme) => ({
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
            ...genStyles.fontSM
        },
        actionsPanel: {
            margin: '24px 0 16px',
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
            },
            '@global .react-datepicker-wrapper': {
                ...genStyles.flex
            },

        },
        filterInput: {
            boxShadow: 'none!important',
            backgroundColor: 'white',
            border: '1px solid ' + tKUIColors.black3,
            color: tKUIColors.black1,
            height: '32px',
            padding: '6px 12px',
            ...DeviceUtil.isPhone ? genStyles.fontM : genStyles.fontS,
            ...genStyles.grow,
            '&::placeholder': {
                color: tKUIColors.black2
            },
            ...genStyles.borderRadius(8),
            ...genStyles.grow
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
        },
        noResults: {
            ...theme.textSizeBody,
            ...theme.textColorDisabled,
            ...genStyles.flex,
            ...genStyles.center,
            ...genStyles.alignCenter,
            margin: '24px 0',
            textAlign: 'center'
        }
    });