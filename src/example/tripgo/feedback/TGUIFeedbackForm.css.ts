import {TKUIStyles} from "../../../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../../../jss/TKUITheme";
import {TGUIFeedbackFormProps, TGUIFeedbackFormStyle} from "./TGUIFeedbackForm";
import genStyles from "../../../css/GenStyle.css";
import {resetStyles} from "../../../css/ResetStyle.css";
import DeviceUtil from "../../../util/DeviceUtil";

export const tGUIFeedbackFormDefaultStyle: TKUIStyles<TGUIFeedbackFormStyle, TGUIFeedbackFormProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            padding: '10px 15px',
            ...genStyles.fontS,
            height: '100%'
        },
        row: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            marginBottom: '18px',
            position: 'relative'
        },
        label: {
            ...theme.textColorGray,
            marginRight: '10px'
        },
        input: {
            ...resetStyles.input,
            ...genStyles.grow,
            ...theme.textColorDefault,
            ...DeviceUtil.isPhone ? genStyles.fontM : theme.textSizeCaption
        },
        msgTextArea: {
            border: 'none',
            ...genStyles.fontSM,
            marginRight: '-15px',
            marginLeft: '-15px',
            paddingRight: '15px',
            paddingLeft: '15px',
            borderTop: '1px solid ' + tKUIColors.black4,
            paddingTop: '15px',
            resize: 'none',
            ...genStyles.grow
        },
        footer: {
            ...theme.textColorGray,
            marginRight: '-15px',
            marginLeft: '-15px',
            paddingRight: '15px',
            paddingLeft: '15px',
            borderTop: '1px solid ' + tKUIColors.black4,
            paddingTop: '10px',
            marginTop: '10px',
            ...genStyles.fontSM
        }
        ,
        fieldError: {
            position: 'absolute',
            color: theme.colorError,
            top: '20px',
            ...genStyles.fontSM
        }
    });