import {TKUIStyles} from "../jss/StyleHelper";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "./TKUITripPlanner";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUITripPlannerDefaultStyle: TKUIStyles<TKUITKUITripPlannerStyle, TKUITKUITripPlannerProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            width: '100%',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                height: '100%',
                overflowY: 'hidden!important'
            },
            '& input[type=text]': {
                fontFamily: theme.fontFamily
            }
        },
        queryPanel: {
            position: 'absolute',
            width: '450px',
            top: '10px',
            left: '10px',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                width: '450px',
                left: '10px',
                zIndex: '1005' // above card modal container
            },
            ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
                width: '100%',
                top: '0',
                left: '0',
                padding: '5px 5px 0 5px',
                zIndex: '1001' // below card modal container
            }
        },
        mapMain: {
            position: 'relative',
            overflowY: 'hidden!important',
            ...genStyles.flex,
            ...genStyles.grow,
            ...genStyles.column
        },
        reportBtn: {
            position: 'absolute',
            right: '12px',
            width: '30px',
            height: '30px',
            opacity: '.5',
            cursor: 'pointer',
            // TODO: replaced next props by two separate classes below until making
            // a props update refresh injected css. See comment in StyleHelper.onRefreshStyles
            // Increase z-index just on landscape to avoid button getting behind modal background.
            // zIndex: (props: TKUITKUITripPlannerProps) => props.landscape || (props.portrait && !DeviceUtil.isPhone) ? '2000' : '1000'
            // bottom: (props: TKUITKUITripPlannerProps) => props.landscape ? '80px' : undefined,
            // top: (props: TKUITKUITripPlannerProps) => props.portrait ? (props.directionsView ? '128px' : '113px') : undefined,
            // zIndex: (props: TKUITKUITripPlannerProps) => props.landscape ? '2000' : '1000'
        },
        reportBtnLandscape: {
            bottom: '80px',
            top: undefined,
            zIndex: '2000'
        },
        reportBtnPortrait: {
            bottom: undefined,
            top: (props: TKUITKUITripPlannerProps) => props.directionsView ? '128px' : '113px',
            zIndex: (props: TKUITKUITripPlannerProps) => '1000'
        }
    });