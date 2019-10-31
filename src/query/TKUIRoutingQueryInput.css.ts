import {TKUIStyles} from "../jss/StyleHelper";
import {ITKUIRoutingQueryInputProps, ITKUIRoutingQueryInputStyle} from "./TKUIRoutingQueryInput";
import genStyles from "../css/GenStyle.css";
import {tKUIColors, TKUITheme} from "../jss/TKStyleProvider";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIRoutingQueryInputDefaultStyle: TKUIStyles<ITKUIRoutingQueryInputStyle, ITKUIRoutingQueryInputProps> =
    (theme: TKUITheme) => ({
        main: {
            backgroundColor: 'white',
            boxShadow: '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)!important',
            ...genStyles.borderRadius(12, "px")
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
        fromToPanel: {
            marginBottom: '20px',
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        fromToInputsPanel: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow
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
            padding: '0 15px',
            '& input': {
                border: 'none',
                background: 'initial',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                MsAppearance: 'none',
                OAppearance: 'none',
                WebkitBoxShadow: 'none!important',
                MozBoxShadow: 'none!important',
                boxShadow: 'none!important',
                margin: 'initial',
                height: 'initial',
                lineHeight: 'normal'
            }
        },
        timePrefFace: {
            cursor: 'pointer',
            '&:after': {
                content: '\"\\25be\"',
                marginLeft: '-15px'
            }
        },
        timePref: {
            ...resetStyles.select,
            padding: '10px 0',
            marginRight: '5px',
            cursor: 'pointer',
            paddingRight: '15px',
            /* z-index: 1; */
            position: 'relative'
        },
        transportsBtn: {
            padding: '10px 0',
            ...resetStyles.button
        }
    });