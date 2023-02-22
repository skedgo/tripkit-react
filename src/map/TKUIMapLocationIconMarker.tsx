import React, { useContext } from "react";
import { CSSProps, renderToStaticMarkup, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { isRemoteIcon, tKUIMapLocationIconDefaultStyle } from "./TKUIMapLocationIcon.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import classNames from "classnames";
import ModeLocation from "../model/location/ModeLocation";
import TKUIMapLocationIcon, { IClientProps, TKUIMapLocationIconProps, TKUIMapLocationIconRaw, TKUIMapLocationIconStyle } from "./TKUIMapLocationIcon";
import { Marker } from "react-leaflet";
import L from "leaflet";
import TKUIConfigProvider, { TKUIConfigContext } from "../config/TKUIConfigProvider";

const config: TKComponentDefaultConfig<TKUIMapLocationIconProps, TKUIMapLocationIconStyle> = {
    render: props => <TKUIMapLocationIconMarker {...props} />,
    styles: tKUIMapLocationIconDefaultStyle,
    classNamePrefix: "TKUIMapLocationIcon",
};

const TKUIMapLocationIconMarker: React.FunctionComponent<TKUIMapLocationIconProps> =
    // ({ from, readonly, onMapLocChanged, getLocationPopup }) =>
    props => {
        const { location, from } = props;
        const config = useContext(TKUIConfigContext);
        return <Marker
            position={location!}
            icon={L.divIcon({
                html: renderToStaticMarkup(
                    <TKUIConfigProvider config={config}>
                        <TKUIMapLocationIconRaw {...props} />
                    </TKUIConfigProvider>
                ),
                iconSize: [26, 39],
                iconAnchor: [13, 39],
                className: "LeafletMap-pinTo"
            })}
            // draggable={!this.props.readonly}
            riseOnHover={true}
            ondragend={(event: L.DragEndEvent) => {
                // const latLng = event.target.getLatLng();
                // this.onMapLocChanged(true, LatLng.createLatLng(latLng.lat, latLng.lng));
            }}
            keyboard={false}
            onadd={event => event.target.openPopup()}
        >
            {/* {this.getLocationPopup(this.props.from!)} */}
        </Marker>;
    }

export default connect((config: TKUIConfig) => config.TKUIMapLocationIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));