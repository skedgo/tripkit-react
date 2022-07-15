import {black, TKUITheme, white} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";

export const tKUITransportPinDefaultStyle = (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.alignCenter
        },
        pin: {
            position: 'initial!important',
            height: '48px',
            width: '48px',
            outline: 'none!important',
            '& circle, path': {
                fill: props => white(0, props.isIconForDark),
                stroke: props => black(0, props.isIconForDark)
            }
        },
        transport: {
            position: 'absolute',
            zIndex: '2',
            top: '12px',
            left: '50%',
            WebkitTransform: 'translate(-50%)',
            MozTransform: 'translate(-50%)',
            MsTransform: 'translate(-50%)',
            OTransform: 'translate(-50%)',
            transform: 'translate(-50%)',
            width: '24px',
            height: '24px'            
        },
        timeLabel: {
            position: 'absolute',
            top: '12px',
            left: '30px',
            backgroundColor: black(0, theme.isDark),
            opacity: '.7',
            color: white(0, theme.isDark),
            padding: '3px 10px 3px 14px',
            WebkitBorderRadius: '0 10px 10px 0',
            MozBorderRadius: '0 10px 10px 0',
            borderRadius: '0 10px 10px 0',
            zIndex: '-1',
            ...genStyles.flex,
            ...genStyles.alignCenter
        },
        realtimeIcon: {
            width: '12px',
            height: '12px',
            marginRight: '3px',
            '& path': {
                fill: white(0, theme.isDark)
            }
        },
        base: {
            marginTop: '-12px'
        },
        firstSegment: {
            '& $transport:hover, $pin:hover~$transport': {
                display: 'none'
            },
            '& $pin:hover path': {
                strokeDasharray: '4',
            },
            '& $pin:hover': {
                opacity: '.9'
            },
            '& $pin:hover~$timeLabel, $transport:hover~$timeLabel': {
                display: 'none'
            }
        },
        arriveSegment: {
            '& circle': {
                fill: '#f66967!important',
                stroke: '#dc5553!important'
            },
            '& $transport:hover, $pin:hover~$transport': {
                display: 'none'
            },
            '& $pin:hover circle': {
                strokeDasharray: '4',
                stroke: black(0, theme.isDark)
            },
            '& $pin:hover': {
                opacity: '.9'
            },
            '& $pin:hover~$timeLabel, $transport:hover~$timeLabel': {
                display: 'none'
            }
        }
    });