import React from "react";
import { Slider, SliderProps } from '@mui/material';
import genStyles, { TK_FOCUS_TARGET_CLASS } from "../css/GenStyle.css";
import { black, TKUITheme, white } from "../jss/TKUITheme";

export type TKUIPrioritySliderProps = {
    value: 0 | 1 | 2,
    onChange: (update: 0 | 1 | 2) => void,
    thumbIconUrl?: string,
    isDarkMode?: boolean,
    theme: TKUITheme,
    color: string,
    ['aria-label']?: string
}

const SLIDER_HEIGHT = 42;

const SliderStyled = ({ thumbIconUrl, tkcolor, ...props }: SliderProps & { thumbIconUrl?: string, tkcolor: string }) =>
    <Slider
        {...props}
        sx={{
            color: 'inherit',
            height: `${SLIDER_HEIGHT}px`,
            padding: '0',
            '& .MuiSlider-rail': {
                top: '0',
                height: '100%',
                background: 'none',
                padding: `0 ${SLIDER_HEIGHT / 2}px`,
                marginLeft: `${-SLIDER_HEIGHT / 2}px`,
                boxSizing: 'content-box'
            },
            '& .MuiSlider-track': {
                height: '100%',
                background: props.value === 0 ? 'none' : tkcolor,
                ...genStyles.borderRadius(SLIDER_HEIGHT / 2),
                paddingLeft: `${SLIDER_HEIGHT}px`,
                boxSizing: 'content-box',
                marginLeft: '-21px',
                border: 'none'
            },
            '& .MuiSlider-thumb': {
                top: 0,
                height: '100%',
                width: SLIDER_HEIGHT,
                border: `5px solid ${props.value === 0 ? white() : tkcolor}`,
                backgroundColor: '#f5f6f6',
                boxShadow: 'none',
                marginTop: 0,
                marginLeft: 0,
                transform: 'translate(-50%, 0)',
                '&:focus,&:hover,&$active': {
                    boxShadow: 'none',
                    // Reset on touch devices, it doesn't add specificity
                    '@media (hover: none)': {
                        boxShadow: 'none',
                    },
                },
                ...thumbIconUrl && {
                    backgroundImage: `url("${thumbIconUrl}")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '22px'
                }
            }
        }}
    />;

class TKUIPrioritySlider extends React.Component<TKUIPrioritySliderProps, {}> {

    constructor(props: TKUIPrioritySliderProps) {
        super(props);
        const { color, isDarkMode } = props;
        // this.WithStyle = withStyles<any, any, SliderProps>({
        //     root: {
        //         color: 'inherit',
        //         height: `${SLIDER_HEIGHT}px`,
        //         padding: '0'
        //     },
        //     rail: {
        //         top: '0',
        //         height: '100%',
        //         background: 'none',
        //         padding: `0 ${SLIDER_HEIGHT / 2}px`,
        //         marginLeft: `${-SLIDER_HEIGHT / 2}px`,
        //         boxSizing: 'content-box'
        //     },
        //     track: ({ value }) => ({
        //         height: '100%',
        //         background: value === 0 ? 'none' : color,
        //         ...genStyles.borderRadius(SLIDER_HEIGHT / 2),
        //         paddingLeft: `${SLIDER_HEIGHT}px`,
        //         boxSizing: 'content-box',
        //         marginLeft: '-21px'
        //     }),
        //     thumb: ({ value }) => ({
        //         height: '100%',
        //         width: SLIDER_HEIGHT,
        //         border: `5px solid ${value === 0 ? white() : color}`,
        //         backgroundColor: '#f5f6f6',
        //         boxShadow: 'none',
        //         marginTop: 0,
        //         marginLeft: 0,
        //         transform: 'translate(-50%, 0)',
        //         '&:focus,&:hover,&$active': {
        //             boxShadow: 'none',
        //             // Reset on touch devices, it doesn't add specificity
        //             '@media (hover: none)': {
        //                 boxShadow: 'none',
        //             },
        //         },
        //         ...this.props.thumbIconUrl && {
        //             backgroundImage: `url("${this.props.thumbIconUrl}")`,
        //             backgroundRepeat: 'no-repeat',
        //             backgroundPosition: 'center',
        //             backgroundSize: '22px'
        //         }
        //     })
        // })(Slider);
    }

    public render(): React.ReactNode {
        const { thumbIconUrl: thumbIcon, isDarkMode, theme, value, onChange, "aria-label": ariaLabel } = this.props;
        return (
            <div style={{
                ...genStyles.flex,
                backgroundColor: black(4, isDarkMode),
                borderRadius: `${SLIDER_HEIGHT / 2}px`,
                padding: `0 ${SLIDER_HEIGHT / 2}px`
            }}>
                <SliderStyled
                    value={value}
                    onChange={(e, value) => onChange(value as any)}
                    classes={{ thumb: TK_FOCUS_TARGET_CLASS }}
                    min={0}
                    max={2}
                    step={1}
                    aria-label={ariaLabel}
                    thumbIconUrl={thumbIcon}
                    tkcolor={this.props.color}
                />
            </div>
        );
    }
}

export default TKUIPrioritySlider;