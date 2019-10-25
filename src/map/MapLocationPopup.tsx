import * as React from "react";
import Location from "../model/Location";
import BikePodLocation from "../model/location/BikePodLocation";
import "./MapLocationPopup.css";
import {resetStyles} from "../css/ResetStyle.css";
import {ReactComponent as IconTimes} from '../images/ic-clock.svg';
import genStyles from "../css/GenStyle.css";

interface IProps {
    value: Location;
    onAction?: () => void;
}

class MapLocationPopup extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const link = this.props.value instanceof BikePodLocation ? "https://airbike.network/#download" : undefined;
        return (
            <div className="MapLocationPopup"
                 style={{...genStyles.flex, ...genStyles.alignCenter, ...genStyles.fontS}}
            >
                {this.props.onAction &&
                <button onClick={this.props.onAction}
                        style={{
                            ...resetStyles.button,
                            marginRight: '10px',
                            borderRight: '1px solid #23b15e',
                            paddingRight: '10px'
                        }}
                >
                    <IconTimes/>
                </button>}
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