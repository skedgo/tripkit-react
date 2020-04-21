import * as React from "react";
import { PolylineProps } from "react-leaflet";
import Street from "../model/trip/Street";
import ModeInfo from "../model/trip/ModeInfo";
interface IProps {
    color: string;
    modeInfo?: ModeInfo;
    streets: Street[];
    polylineOptions: PolylineProps | PolylineProps[];
    id: string;
}
declare class StreetsPolyline extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default StreetsPolyline;
