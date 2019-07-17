import * as React from "react";
import {Polyline, PolylineProps} from "react-leaflet";
import Street from "../model/trip/Street";
import ModeInfo from "../model/trip/ModeInfo";

interface IProps {
    color: string;
    modeInfo?: ModeInfo;
    streets: Street[];
    polylineOptions: PolylineProps | PolylineProps[];
    id: string;
}

class StreetsPolyline extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const polylineOptions = this.props.polylineOptions;
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        return polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={this.props.id + "-" + i}/>);
    }
}

export default StreetsPolyline;