import {tKUIColors, TKUITheme} from "../../../jss/TKUITheme";
import {TKUIStyles} from "../../../jss/StyleHelper";
import genStyles from "../../../css/GenStyle.css";
import {tGUIFeedbackFormDefaultStyle} from "../feedback/TGUIFeedbackForm.css";
import {TGUILoadTripsViewProps, TGUILoadTripsViewStyle} from "./TGUILoadTripsView";
import DeviceUtil from "../../../util/DeviceUtil";

export const tGUILoadTripsViewDefaultStyle: TKUIStyles<TGUILoadTripsViewStyle, TGUILoadTripsViewProps> =
    (theme: TKUITheme) => ({
        ...(tGUIFeedbackFormDefaultStyle as any)(theme),
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            padding: '30px',
            height: '100%'
        },
        content: {
            position: 'relative',
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow
        },
        msgTextArea: {
            border: 'none',
            marginRight: '-15px',
            marginLeft: '-15px',
            padding: '15px',
            marginBottom: '30px',
            resize: 'none',
            background: 'none',
            ...genStyles.grow,
            ...theme.divider,
            ...theme.textColorDefault,
            ...DeviceUtil.isPhone ? genStyles.fontM : theme.textSizeCaption
        },
        row: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            // ...genStyles.spaceBetween,
            padding: '15px 0',
            position: 'relative'
        },
        newApiKeyButtons: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            marginTop: '15px'
        },
        fieldError: {
            position: 'absolute',
            color: theme.colorError,
            bottom: '10px',
            ...genStyles.fontSM
        },
    });