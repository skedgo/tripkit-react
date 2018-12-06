import * as React from "react";
import Location from "../model/Location";
import BikePodLocation from "../model/location/BikePodLocation";
import "./MapLocationPopup.css";

interface IProps {
    value: Location;
}

class MapLocationPopup extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const link = this.props.value instanceof BikePodLocation ? "https://airbike.network/#download" : undefined;
        return (
            <div className="MapLocationPopup">
                <div>
                    {this.props.value.name}
                </div>
                { link ?
                    <a href={link} target="_blank" className="gl-link">
                        real-time info
                    </a> : null }
            </div>
        );
    }

}

export default MapLocationPopup;