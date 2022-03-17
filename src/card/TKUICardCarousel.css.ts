import {black, cardSpacing, colorWithOpacity, queryWidth, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUICardCarouselProps, TKUICardCarouselStyle} from "./TKUICardCarousel";
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";

export const tKUICardCarouselDefaultStyle: TKUIStyles<TKUICardCarouselStyle, TKUICardCarouselProps> =
    (theme: TKUITheme) => ({
        modalContainer: {
            alignItems: 'unset!important',
            // Warn: in Safari overflow property does not override it's specific variants overflow-x and overflow-y,
            // so need to explicitly set overflowY to hidden to override overflowY value.
            // overflowY: 'hidden!important',
            left: '0!important',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                width: queryWidth + 2 * cardSpacing() + 'px' // 2 * cardSpacing of left and right padding on pageWrapper class
            },
            ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
                width: '100%'
            },
            '&>*': {
                paddingBottom: (props: TKUICardCarouselProps) => !DeviceUtil.isTouch() ? cardSpacing(props.landscape) + 'px' : '0'
            }
        },
        main: {
            width: '100%',
            height: '100%',
            '& .slider.animated .slide, .carousel .slide': {
                padding: '35px 0 0',
                height: '100%',
                background: 'none'
            },
            '& .carousel .control-dots': {
                top: '5px',
                position: 'absolute',
                textAlign: 'center',
                width: '70%',
                height: '25px',
                margin: '0 15% 0 15%',
                padding: '0'
            },
            '& .carousel .control-dots .dot': {
                transition: 'opacity .25s ease-in',
                opacity: '.5',
                background: black(0, theme.isDark),
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                cursor: 'pointer',
                display: 'inline-block',
                margin: '0 8px'
            },
            '& .carousel .control-dots .dot.selected': {
                opacity: '1'
            },
            '& > *, .carousel-slider, .slider-wrapper, .slider': {
                height: props => props.animated !== false ? '100%' : undefined
            },
            '& .carousel .slide > *': {
                textAlign: 'initial'
            },
            '& .carousel .slide img': {
                width: 'initial'
            },
            '& .carousel.carousel-slider .control-arrow': {
                background: colorWithOpacity(black(0, theme.isDark), .4),
                height: '30px',
                marginRight: '30px',
                marginLeft: '30px',
                opacity: '1',
                borderRadius: '10px',
                fontSize: '14px'
            },
            '& .carousel.carousel-slider .control-arrow:hover': {
                background: black(1, theme.isDark)
            },
            '& .carousel .control-arrow:before, .carousel.carousel-slider .control-arrow:before': {
                margin: '0 10px',
                display: 'inline-block',
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                content: "''"
            }
        },
        lotOfPages: {
            '& .carousel .control-dots': {
                top: '-4px'
            }
        },
        pageWrapper: {
            height: '100%',
            ['@media (min-width: ' + (TKUIResponsiveUtil.getPortraitWidth() + 1) + 'px)']: {
                padding: '0 '+ cardSpacing() +'px'
            },
            ['@media (max-width: ' + TKUIResponsiveUtil.getPortraitWidth() + 'px)']: {
                padding: '0 '+ cardSpacing(false) +'px'
            }
        },
        hidden: {
            '&>*': {
                display: 'none'
            }
        }
    });