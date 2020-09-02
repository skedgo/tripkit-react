import genStyles from "../../../css/GenStyle.css";
import {black, colorWithOpacity, important, TKUITheme} from "../../../jss/TKUITheme";
import {TKUIStyles} from "../../../jss/StyleHelper";
import {TGUIDevSettingsViewProps, TGUIDevSettingsViewStyle} from "./TGUIDevSettingsView";
import {tKUIProfileViewDefaultStyle} from "../../../options/TKUIProfileView.css";
import {resetStyles} from "../../../css/ResetStyle.css";

export const tGUIDevSettingsViewDefaultStyle: TKUIStyles<TGUIDevSettingsViewStyle, TGUIDevSettingsViewProps> =
    (theme: TKUITheme) => {
        const profileViewStyle = (tKUIProfileViewDefaultStyle as any)(theme);
        return ({
            ...profileViewStyle,
            apiKeyOption: {
                ...genStyles.flex,
                ...genStyles.alignCenter,
                ...genStyles.spaceBetween,
                ...theme.textSizeCaption,
                ...theme.textWeightSemibold,
                ...theme.textColorGray,
                cursor: 'pointer',
                padding: '8px 12px',
                '&:active': {
                    backgroundColor: colorWithOpacity(theme.colorPrimary, .4)
                }
            },
            apiKeyOptionFocused: {
                backgroundColor: colorWithOpacity(theme.colorPrimary, .2)
            },
            apiKeyOptionSelected: {
                color: 'white',
                backgroundColor: colorWithOpacity(theme.colorPrimary, .5)
            },
            apiKeyEditBtn: {
                ...resetStyles.button,
                '&:hover': {
                    textDecoration: 'underline'
                }
            },
            optionSelect: {
                ...profileViewStyle.optionSelect,
                minWidth: '200px'
            }
        });
    };