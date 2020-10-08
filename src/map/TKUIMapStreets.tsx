import * as React from "react";
import {Polyline, PolylineProps} from "react-leaflet";
import Street from "../model/trip/Street";
import ModeInfo from "../model/trip/ModeInfo";
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIFriendlinessColors} from "../trip/TKUIWCSegmentInfo.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    streets: Street[];
    color: string;
    toPolylineProps?: (streets: Street[], color: string) => PolylineProps | PolylineProps[];
    modeInfo?: ModeInfo;
    id: string;
}

export interface IStyle {}

export type TKUIMapStreetsProps = IProps;
export type TKUIMapStreetsStyle = IStyle;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapStreets {...props}/>,
    styles: {},
    classNamePrefix: "TKUIMapStreets"
};


class TKUIMapStreets extends React.Component<IProps, {}> {

    /**
     * if color === null show friendliness (which makes sense for bicycle and wheelchair segments)
     */
    private streetsRenderer(streets: Street[], color: string | null) {
        return streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 9,
                color: "black",
                opacity: 1  // Disable safe distinction for now
            } as PolylineProps
        }).concat(streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 7,
                color: color ? color : street.safe ? tKUIFriendlinessColors.safe :
                    street.safe === false ? tKUIFriendlinessColors.unsafe :
                        street.dismount ? tKUIFriendlinessColors.dismount : tKUIFriendlinessColors.unknown,
                opacity: 1  // Disable safe distinction for now
            } as PolylineProps
        }));
    }

    public render(): React.ReactNode {
        const polylineOptions = this.props.toPolylineProps ? this.props.toPolylineProps(this.props.streets, this.props.color) :
            this.streetsRenderer(this.props.streets, this.props.color);
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        return polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={this.props.id + "-" + i}/>);
    }
}

export default connect((config: TKUIConfig) => config.TKUIMapStreets, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));