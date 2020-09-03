import {tKUIColors, TKUITheme} from "../../../jss/TKUITheme";
import {TKUIStyles} from "../../../jss/StyleHelper";
import genStyles from "../../../css/GenStyle.css";
import {tGUIFeedbackFormDefaultStyle} from "../feedback/TGUIFeedbackForm.css";
import {TGUILoadTripsViewProps, TGUILoadTripsViewStyle} from "./TGUILoadTripsView";

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
            ...genStyles.fontSM,
            marginRight: '-15px',
            marginLeft: '-15px',
            borderBottom: '1px solid ' + tKUIColors.black4,
            padding: '15px',
            marginBottom: '30px',
            resize: 'none',
            ...genStyles.grow
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