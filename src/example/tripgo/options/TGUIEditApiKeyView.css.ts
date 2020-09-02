import {TKUITheme} from "../../../jss/TKUITheme";
import {TKUIStyles} from "../../../jss/StyleHelper";
import {TGUIEditApiKeyViewProps, TGUIEditApiKeyViewStyle} from "./TGUIEditApiKeyView";
import genStyles from "../../../css/GenStyle.css";
import {tGUIFeedbackFormDefaultStyle} from "../feedback/TGUIFeedbackForm.css";

export const tGUIEditApiKeyViewDefaultStyle: TKUIStyles<TGUIEditApiKeyViewStyle, TGUIEditApiKeyViewProps> =
    (theme: TKUITheme) => ({
        ...(tGUIFeedbackFormDefaultStyle as any)(theme),
        newApiKey: {
            ...genStyles.flex,
            ...genStyles.column,
            padding: '30px'
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
            top: '38px',
            ...genStyles.fontSM
        },
    });