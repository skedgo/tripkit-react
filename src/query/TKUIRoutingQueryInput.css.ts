import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle} from "./TKUIRoutingQueryInput";
import genStyles from "../css/GenStyle.css";
import {colorWithOpacity, tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";
import DeviceUtil from "../util/DeviceUtil";
import {CSSProperties} from "react-jss";

export const tKUIRoutingQueryInputDefaultStyle: TKUIStyles<TKUIRoutingQueryInputStyle, TKUIRoutingQueryInputProps> =
    (theme: TKUITheme) => ({
        btnBack: {
            ...resetStyles.button,
            padding: '0',
            margin: '10px',
            height: '24px',
            width: '24px',
            cursor: 'pointer'
        },
        fromToPanel: {
            marginBottom: (props: TKUIRoutingQueryInputProps) => props.landscape ? '20px' : '0',
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
            backgroundColor: colorWithOpacity(theme.colorPrimary, .7)
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
            padding: '10px',
            ...theme.textSizeCaption,
            ...theme.textWeightSemibold,
            ...theme.textColorGray
        },
        timePrefSelect: {
            minWidth: '92px'
        }
    });