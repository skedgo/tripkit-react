import React, { useEffect } from "react";
import { TKRenderOverride } from "../config/TKConfigHelper";
import TKUIMapLocationIcon, { tKUIMapLocationIconConfig } from "./TKUIMapLocationIcon";
import MemoMarker from "./MemoMarker";
import Location from "../model/Location";
import ModeLocation from "../model/location/ModeLocation";
import TransportUtil from "../trip/TransportUtil";
import NetworkUtil from "../util/NetworkUtil";

interface TKUIMapLocationMarkerProps {
    location: Location;
    draggable?: boolean;
    ondragend?: (event: L.DragEndEvent) => void;
    isFrom?: boolean;
    children?: React.ReactNode;
}

const TKUIMapLocationMarker: React.FunctionComponent<TKUIMapLocationMarkerProps> = (props: TKUIMapLocationMarkerProps) => {
    const { location, draggable, ondragend, isFrom, children } = props;
    const [imgHtml, setImgHtml] = React.useState<string>("");
    useEffect(() => {
        if (location instanceof ModeLocation && location.modeInfo.remoteIconIsTemplate && TransportUtil.getTransportIconRemote(location.modeInfo)) {
            NetworkUtil.fetch(TransportUtil.getTransportIconRemote(location.modeInfo)!, {}, true)
                .then((data) => setImgHtml(data))
                .catch((error) => console.error('Error fetching SVG:', error));
        }
    }, [location]);
    return (
        <TKRenderOverride   // This is to move jss injection outside renderToStaticMarkup, since otherwise styles get broken.
            componentKey={"TKUIMapLocationIcon"}
            renderOverride={(renderProps, configRender) => {
                const render = configRender ?? tKUIMapLocationIconConfig.render;
                return (
                    <MemoMarker
                        position={location}
                        renderIcon={render}
                        renderIconProps={renderProps}
                        reactiveIconProps={{
                            location,
                            theme: renderProps.theme,
                            imgHtml
                        }}
                        iconSize={[26, 39]}
                        iconAnchor={[13, 39]}
                        iconClass="LeafletMap-pinTo"
                        draggable={draggable}
                        riseOnHover={true}
                        ondragend={ondragend}
                        keyboard={false}
                        onadd={event => event.target.openPopup()}
                    >
                        {children}
                    </MemoMarker>
                );
            }}
        >
            <TKUIMapLocationIcon
                from={isFrom}
                location={location}
                imgHtml={imgHtml}
            />
        </TKRenderOverride>
    );
}

export default TKUIMapLocationMarker;