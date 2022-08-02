import { TKUITKUITripPlannerProps } from "./TKUITripPlanner";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import { cardSpacing, queryWidth, TKUITheme, white } from "../jss/TKUITheme";
import genStyles, { TK_FOCUS_TARGET_CLASS } from "../css/GenStyle.css";

export const tKUITripPlannerDefaultStyle = (theme: TKUITheme) => ({
    modalMain: {
        ...genStyles.flex,
        width: '100%',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            height: '100%',
            overflowY: 'hidden!important'
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            height: '100%'
        },
        '& input[type=text]': {
            fontFamily: theme.fontFamily
        },
        /**
         * For when trip planner is embedded:
         * Set position relative so when the trip planner is embedded, modals (including slide-ups) are positioned relative to
         * this panel, and not to embedding app panel.
         * But position relative cause slide-up to behave bad on mobile (the part of the slide up that is
         * hidden past the bottom of the screen (overflow) makes the whole screen to scroll until it becomes
         * visible) so also need to add do the heigh: 100% and overflowY: hidden:
         */
        // position: 'relative',
        // height: '100%',
        // overflowY: 'hidden!important'
        /**
         * TODO!: fix issue: Relative positioning causes other issues on slide-up on mobile (breaks slide-up
         * behaviour), so disable in general for now, and just enable when need to embed, e.g. for documentation.
         * Other issue related to slide-up: it behaves smoother in a prev. version (viz.
         * e6a0bdf3161c81495d28638d67b7c4c5f2316049 commit of 13/08/2020), but just for routing results view, which
         * is very strange. See if I can get slide-up working like that again, and for all views.
         */
    },
    main: {
        ...genStyles.flex,
        width: '100%',
        position: 'relative'
    },
    queryPanel: {
        position: 'absolute',
        ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
            width: queryWidth + 'px',
            top: cardSpacing() + 'px',
            left: cardSpacing() + 'px',
            zIndex: '1005' // above card modal container
        },
        ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
            width: '100%',
            top: '0',
            left: '0',
            padding: cardSpacing(false) + 'px ' + cardSpacing(false) + 'px 0 ' + cardSpacing(false) + 'px',
            zIndex: '1001' // below card modal container
        },
        '&>*:not(:first-child)': {
            marginTop: '16px'
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
        right: '10px'            
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
    },
    carouselPage: {
        height: '100%',
        '&>*': {
            height: '100%'
        }
    },
    stacktrace: {
        overflowY: 'auto',
        maxHeight: '80vh',
        marginTop: '10px',
        textAlign: 'left'
    },
    renderTopRight: {
        position: 'absolute',
        top: '16px',
        right: '55px'
    },
    searchMenuContainer: {
        marginTop: '1px'
    },
    ariaFocusEnabled: {
        [
            '& input[type=text]:focus,' +
            '& input[type=email]:focus,' +
            '& input[aria-autocomplete=list]:focus,' +
            '& button:focus,' +
            '& a:focus,' +
            '& select:focus,' +
            '& textarea:focus,' +
            '& div:focus,' +
            '&:focus,' +
            '& .' + TK_FOCUS_TARGET_CLASS + ':focus'
        ]: {
            boxShadow: '0px 0px 3px 3px #024dff!important'  // To prevail to boxShadow: none of resetStyles.
        }
    }
});