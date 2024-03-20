import React from "react";
import { TileLayer, TileLayerProps } from "react-leaflet";
import Util from "../util/Util";
export default (props: TileLayerProps) => {
    const { attribution, ...restProps } = props;
    return (
        <TileLayer
            {...restProps}
            attribution={Util.addSkedGoTermsToMapAttribution(attribution)}
        />
    );
};