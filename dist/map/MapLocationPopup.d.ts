import * as React from "react";
import Location from "../model/Location";
import "./MapLocationPopup.css";
interface IProps {
    value: Location;
    onAction?: () => void;
}
declare class MapLocationPopup extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default MapLocationPopup;
