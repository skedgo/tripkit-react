import React from "react";
import { Slider, SliderProps } from '@mui/material';
import genStyles, { TK_FOCUS_TARGET_CLASS } from "../css/GenStyle.css";
import { TKUITheme, white } from "../jss/TKUITheme";

export type TKUISliderProps = SliderProps &
{
    thumbIconUrl?: string,
    label?: string,
    leftLabel?: string,
    rightLabel?: string,
    isDarkMode?: boolean,
    theme: TKUITheme
}

const SliderStyled = ({ thumbIconUrl, isDarkMode, ...props }: { thumbIconUrl?: string, isDarkMode?: boolean } & SliderProps) => {
    const iOSBoxShadow = !isDarkMode ?
        '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)!important' :
        '0 3px 1px rgba(255,255,255,0.1),0 0px 8px rgba(255,255,255,0.2),0 0 0 1px rgba(255,255,255,0.1)!important';
    return (
        <Slider
            {...props}
            sx={{
                color: 'inherit',
                '& .MuiSlider-thumb': {
                    top: 0,
                    height: 28,
                    width: 28,
                    backgroundColor: white(0, isDarkMode),
                    boxShadow: iOSBoxShadow,
                    marginTop: '14px',
                    marginLeft: '14px',
                    '&:focus,&:hover,&$active': {
                        boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
                        // Reset on touch devices, it doesn't add specificity
                        '@media (hover: none)': {
                            boxShadow: !isDarkMode ?
                                '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)!important' :
                                '0 3px 1px rgba(255,255,255,0.1),0 0px 8px rgba(255,255,255,0.2),0 0 0 1px rgba(255,255,255,0.1)!important',
                        },
                    },
                    ...thumbIconUrl && {
                        backgroundImage: `url("${thumbIconUrl}")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                    }
                }
            }} />
    );
}

const TKUISlider: React.FunctionComponent<TKUISliderProps> = (props: TKUISliderProps) => {
    const { thumbIconUrl: thumbIcon, label, leftLabel, rightLabel, isDarkMode, theme, ...sliderProps } = props;
    return (
        <div style={genStyles.fontS as any}>
            <SliderStyled {...sliderProps} classes={{ thumb: TK_FOCUS_TARGET_CLASS }} />
            <div style={{ ...genStyles.flex, ...genStyles.spaceBetween, ...theme.textColorDefault } as any}>
                <span style={{ minWidth: '100px' }}>{props.leftLabel}</span>
                <span>{props.label}</span>
                <span style={{ minWidth: '100px', textAlign: 'right' }}>{props.rightLabel}</span>
            </div>
        </div>
    );
}

export default TKUISlider;