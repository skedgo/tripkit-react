import {black, tKUIColors, TKUITheme, white} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITransportOptionsRowProps, TKUITransportOptionsRowStyle} from "./TKUITransportOptionsRow";
import genStyles from "../css/GenStyle.css";
import {tKUIProfileViewDefaultStyle} from "./TKUIProfileView.css";

export const tKUITransportOptionsRowStyle: TKUIStyles<TKUITransportOptionsRowStyle, TKUITransportOptionsRowProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '15px',
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...theme.textColorDefault,
            ...theme.textSizeBody,
            '& .MuiExpansionPanelDetails-root': {
                background: '#efefef'
            }
        },
        iconExpand: {
            width: '20px',
            height: '20px',
            ...genStyles.svgFillCurrColor,
            color: theme.colorPrimary
        },
        transIcon: {
            margin: '0 10px'
        },
        expansionPanel: {
            ...theme.divider,
            background: white(0, theme.isDark),
            color: black(0, theme.isDark),
            '&:before': {
                display: 'none'
            }
        },
        expansionPanelDetails: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.grow,
            background: theme.isLight ? '#efefef' : white(3),
            padding: '15px 10px!important',
            '& > div:not(:last-child)': {
                marginBottom: '15px'
            }
        },
        section: {
            ...genStyles.flex,
            ...genStyles.column
        },
        sectionTitle: {
            padding: '10px 20px 10px',
            textTransform: 'uppercase',
            fontSize: '14px'
        },
        sectionBody: {
            ...genStyles.flex,
            ...genStyles.column,
            background: white(0, theme.isDark),
            padding: '10px 20px',
            '& > div:not(:last-child)': {
                borderBottom: '1px solid ' + tKUIColors.black4,
                marginBottom: '10px'
            },
            '&:empty': {
                display: 'none'
            }
        },
        checkboxRow: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            textTransform: 'capitalize'
        },
        sliderRow: {
            ...genStyles.flex,
            ...genStyles.column,
            background: white(0, theme.isDark),
            padding: '10px 0',
            '& > *:last-child': {
                color: theme.colorPrimary
            }
        },
        sliderHeader: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween
        },
        prefModeTitle: {
            ...genStyles.grow
        },
        // Temporary until factor out common style, or define a special component TKUIDropdownBtn, or just make
        // TKUISelect to default to this style, and adapt other uses (from TKUIRoutingQueryInput and TKUIResultsView)
        walkSpeedSelect: (tKUIProfileViewDefaultStyle as any)(theme).optionSelect
});