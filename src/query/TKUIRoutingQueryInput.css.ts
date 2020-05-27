import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle} from "./TKUIRoutingQueryInput";
import genStyles from "../css/GenStyle.css";
import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import DeviceUtil from "../util/DeviceUtil";
import {CSSProperties} from "react-jss";

export const tKUIRoutingQueryInputDefaultStyle: TKUIStyles<TKUIRoutingQueryInputStyle, TKUIRoutingQueryInputProps> =
    (theme: TKUITheme) => ({
        main: {
            backgroundColor: 'white',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            ...genStyles.borderRadius(12, "px"),
            fontFamily: theme.fontFamily
        },
        header: {
            padding: '12px 16px',
            color: 'black',
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween
        },
        title: {
            ...genStyles.fontL,
        },
        btnClear: {
            ...resetStyles.button,
            padding: '0',
            height: '24px',
            width: '24px',
            cursor: 'pointer',
            ...genStyles.alignSelfStart
        },
        iconClear: {
            color: 'black',
            width: '100%',
            height: '100%',
            ...genStyles.svgFillCurrColor
        },
        btnBack: {
            ...resetStyles.button,
            padding: '0',
            margin: '10px',
            height: '24px',
            width: '24px',
            cursor: 'pointer'
        },
        fromToPanel: {
            marginBottom: '20px',
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        fromToInputsPanel: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow,
            '& input': {
                ...DeviceUtil.isPhone && { fontSize: '16px!important' }
            } as CSSProperties<TKUIRoutingQueryInputProps>
        },
        locSelector: {
            padding: '9px 15px',
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            ...genStyles.alignSelfStretch
        },
        locIcon: {
            width: '12px',
            height: '12px',
            boxSizing: 'border-box',
            border: '2px solid ' + tKUIColors.black1,
            ...genStyles.borderRadius(50, "%")
        },
        locTarget: {
            borderColor: theme.colorPrimary,
            backgroundColor: theme.colorPrimaryOpacity(.7)
        },
        dotIcon: {
            width: '2px',
            height: '2px',
            background: tKUIColors.black1
        },
        divider: {
            borderBottom: '1px solid ' + tKUIColors.black4
        },
        swap: {
            cursor: 'pointer',
            padding: '10px',
            boxSizing: 'content-box!important'
        },
        footer: {
            backgroundColor: '#e6eff2',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            borderTop: '1px solid ' + tKUIColors.black4,
            padding: '0 5px 0 15px',
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween
        },
        transportsBtn: {
            ...resetStyles.button,
            padding: '10px'
        },
        timePrefSelect: {
            minWidth: '92px'
        }
    });