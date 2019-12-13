import * as React from "react";
import {Slider, SliderProps, withStyles} from '@material-ui/core';
import Constants from "../util/Constants";
import genStyles from "../css/GenStyle.css";

export type TKUISliderProps = SliderProps &
    {
        thumbIcon: string,
        label?: string,
        leftLabel?: string,
        rightLabel?: string
    }

class TKUISlider extends React.Component<TKUISliderProps, {}> {

    private WithStyle: any;

    constructor(props: TKUISliderProps) {
        super(props);
        const iOSBoxShadow =
            '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)!important';
        this.WithStyle = withStyles({
            root: {
                color: 'inherit',
            },
            thumb: {
                height: 28,
                width: 28,
                backgroundColor: '#fff',
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
                backgroundImage: 'url("' + Constants.absUrl(this.props.thumbIcon) + '")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            },
            // valueLabel: {
            //     left: 'calc(-50% + 11px)',
            //     top: 33,
            //     '& *': {
            //         background: 'transparent',
            //         color: '#000',
            //     },
            //     fontFamily: 'inherit',
            //     ...genStyles.fontS
            // },
        })(Slider);
    }

    public render(): React.ReactNode {
        return (
            <div style={genStyles.fontS}>
                <this.WithStyle {...this.props}/>
                <div style={{...genStyles.flex, ...genStyles.spaceBetween, color: 'black'}}>
                    <span style={{minWidth: '100px'}}>{this.props.leftLabel}</span>
                    <span>{this.props.label}</span>
                    <span style={{minWidth: '100px', textAlign: 'right'}}>{this.props.rightLabel}</span>
                </div>
            </div>
        );
    }
}

export default TKUISlider;