import * as React from "react";
import {Slider, SliderProps, withStyles} from '@material-ui/core';
import Constants from "../util/Constants";
import genStyles from "../css/GenStyle.css";
import {black, white} from "../jss/TKUITheme";

export type TKUISliderProps = SliderProps &
    {
        thumbIcon?: string,
        label?: string,
        leftLabel?: string,
        rightLabel?: string,
        isDarkMode?: boolean
    }

class TKUISlider extends React.Component<TKUISliderProps, {}> {

    private WithStyle: any;

    constructor(props: TKUISliderProps) {
        super(props);
        const iOSBoxShadow = !props.isDarkMode ?
            '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)!important' :
            '0 3px 1px rgba(255,255,255,0.1),0 0px 8px rgba(255,255,255,0.2),0 0 0 1px rgba(255,255,255,0.1)!important';
        this.WithStyle = withStyles({
            root: {
                color: 'inherit',
            },
            thumb: {
                height: 28,
                width: 28,
                backgroundColor: white(0, this.props.isDarkMode),
                boxShadow: iOSBoxShadow,
                marginTop: -14,
                marginLeft: -14,
                '&:focus,&:hover,&$active': {
                    boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
                    // Reset on touch devices, it doesn't add specificity
                    '@media (hover: none)': {
                        boxShadow: iOSBoxShadow,
                    },
                },
                ...this.props.thumbIcon && {
                    backgroundImage: 'url("' + Constants.absUrl(this.props.thumbIcon) + '")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }
            }
        })(Slider);
    }

    public render(): React.ReactNode {
        const {thumbIcon, label, leftLabel, rightLabel, ...sliderProps} = this.props;
        return (
            <div style={genStyles.fontS}>
                <this.WithStyle {...sliderProps}/>
                <div style={{...genStyles.flex, ...genStyles.spaceBetween, color: black(0, this.props.isDarkMode)}}>
                    <span style={{minWidth: '100px'}}>{this.props.leftLabel}</span>
                    <span>{this.props.label}</span>
                    <span style={{minWidth: '100px', textAlign: 'right'}}>{this.props.rightLabel}</span>
                </div>
            </div>
        );
    }
}

export default TKUISlider;