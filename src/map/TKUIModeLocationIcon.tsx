import * as React from "react";
import TransportUtil from "../trip/TransportUtil";
import genStyles from "../css/GenStyle.css";
import * as CSS from 'csstype';
import {black, white} from "../jss/TKUITheme";
import {getTransIconOpacity, isRemoteIcon} from "./TKUIMapLocationIcon.css";
import ModeLocation from "../model/location/ModeLocation";
import FreeFloatingVehicleLocation from "../model/location/FreeFloatingVehicleLocation";

interface IProps {
    stop: ModeLocation;
    style?: CSS.Properties;
    isDarkMode?: boolean;
}

class TKUIModeLocationIcon extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        if (this.props.stop instanceof FreeFloatingVehicleLocation) {
            return <div style={{
                width: '8px',
                height: '8px',
                ...genStyles.borderRadius(50, '%'),
                background: white(0, this.props.isDarkMode),
                border: '1px solid ' + black(0, this.props.isDarkMode)
            }}/>
        }
        const modeInfo = this.props.stop.modeInfo;
        const wantIconForDark = true;
        const transIcon = TransportUtil.getTransportIcon(modeInfo, false, wantIconForDark);
        let transportColor = TransportUtil.getTransportColor(modeInfo);
        if (transportColor === null) {
            transportColor = wantIconForDark ? black(0) : white(1);
        }
        const transportIconIsRemote = isRemoteIcon(modeInfo);
        // If the obtained icon changes if we don't prefer remote over appearance mode (dark / light), then it means
        // transIcon is inverted w.r.t. mode.
        const invertedWrtMode = transIcon !== TransportUtil.getTransportIcon(modeInfo, false, wantIconForDark, false);
        const transIconOnDark = invertedWrtMode ? !wantIconForDark : wantIconForDark;
        const style =
            {
                width: transportIconIsRemote ? '18px' : '20px',
                height: transportIconIsRemote ? '18px' : '20px',
                padding: transportIconIsRemote ? '0' : '3px',
                // If transport icon is remote, then should show over a proper background:
                // - over white (light background) if it's an "for light" icon (modeInfo.remoteIcon), or
                // - over black (dark background) if it's an "for dark" icon (modeInfo.remoteDarkIcon).
                // If it's an icon for light or dark is captured by transIconIsOnDark.
                background: transportIconIsRemote ? white(0, transIconOnDark) : transportColor,
                border: '1px solid ' + (this.props.isDarkMode || transportIconIsRemote ? white(1) : undefined),
                ...genStyles.borderRadius(transportIconIsRemote ? 0 : 50, "%"),
                ...this.props.style,
                ...genStyles.flex,
                ...genStyles.center,
                ...genStyles.alignCenter
            };
        const imgStyle = {
            opacity: getTransIconOpacity(modeInfo, !!this.props.isDarkMode),
            width: '100%',
            height: '100%'
        };
        return (
            <div style={style}>
                <img src={transIcon}
                     style={imgStyle}
                     aria-hidden={true}
                />
            </div>
        );
    }

}

export default TKUIModeLocationIcon;