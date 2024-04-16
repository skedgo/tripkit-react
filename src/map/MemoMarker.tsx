import React, { FunctionComponent, useContext, useMemo } from "react";
import L, { PointExpression } from "leaflet";
import { renderToStaticMarkup } from "../jss/StyleHelper";
import { Marker, MarkerProps } from "react-leaflet";
import TKUIConfigProvider, { TKUIConfigContext } from "../config/TKUIConfigProvider";

interface MemoMarkerProps extends MarkerProps {
    renderIcon: (renderProps: any) => React.ReactNode;
    renderIconProps: any;
    reactiveIconProps: any;
    iconSize?: PointExpression;
    iconAnchor?: PointExpression;
    iconClass?: string;
}

const MemoMarker: FunctionComponent<MemoMarkerProps> = ({ renderIcon, renderIconProps, reactiveIconProps, iconSize, iconAnchor, iconClass, ...markerProps }) => {
    const config = useContext(TKUIConfigContext);
    const icon = useMemo(() => L.divIcon({
        html: renderToStaticMarkup(
            // This is to make TKUIIcon work (it has no style injection, so no issue with jss styles getting broken).
            <TKUIConfigProvider config={config}>
                {renderIcon(renderIconProps)}
            </TKUIConfigProvider>
        ),
        iconSize,
        iconAnchor,
        className: iconClass
    }),
        [...Object.values(reactiveIconProps)]);
    return (
        <Marker
            icon={icon}
            {...markerProps}
        />
    );
}

export default MemoMarker;