import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIRealtimeVehicleDefaultStyle} from "./TKUIRealtimeVehicle.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import genStyles from "../css/GenStyle.css";
import Color from "../model/trip/Color";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: RealTimeVehicle;
    label?: string;
    color?: Color;
}

export interface IStyle {
    main: CSSProps<IProps>;
    vehicleBackground: CSSProps<IProps>;
    bodyBackground: CSSProps<IProps>;
    frontBackground: CSSProps<IProps>;
    vehicle: CSSProps<IProps>;
    body: CSSProps<IProps>;
    front: CSSProps<IProps>;
    label: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {

}

export type TKUIRealtimeVehicleProps = IProps;
export type TKUIRealtimeVehicleStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIRealtimeVehicle {...props}/>,
    styles: tKUIRealtimeVehicleDefaultStyle,
    classNamePrefix: "TKUIRealtimeVehicle"
};

class TKUIRealtimeVehicle extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const value = this.props.value;
        const label = this.props.label;
        const angle = value.location.bearing ? 90 - value.location.bearing : undefined;
        const angleNormalized360 = angle ? (angle + 360) % 360 : undefined;
        return (
            <div className={classes.main}
                 style={angle ? {...genStyles.transformRotate(-angle)} as any : undefined}
            >
                <div className={classes.vehicleBackground}>
                    <div className={classes.bodyBackground}/>
                    <div className={classes.frontBackground}/>
                </div>
                <div className={classes.vehicle}>
                    <div className={classes.body}/>
                    <div className={classes.front}/>
                </div>
                {label &&
                <div className={classes.label}
                     style={angleNormalized360 && 90 < angleNormalized360 && angleNormalized360 < 270 ?
                         {...genStyles.transformRotate(180)} as any : undefined
                     }
                >
                    {label}
                </div>}
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUIRealtimeVehicle, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));