import * as React from "react";
import TransportUtil from "../trip/TransportUtil";
import genStyles from "../css/GenStyle.css";
import * as CSS from 'csstype';
import { black, white } from "../jss/TKUITheme";
import { getTransIconOpacity, isRemoteIcon } from "./TKUIMapLocationIcon.css";
import ModeLocation from "../model/location/ModeLocation";
import FreeFloatingVehicleLocation from "../model/location/FreeFloatingVehicleLocation";
import FacilityLocation from "../model/location/FacilityLocation";
import TKUIIcon from "../service/TKUIIcon";
import Util from "../util/Util";
import CarParkLocation from "../model/location/CarParkLocation";

interface IProps {
    location: ModeLocation;
    style?: CSS.Properties;
    isDarkMode?: boolean;
}

class TKUIModeLocationIcon extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const { location } = this.props;
        if (location instanceof FreeFloatingVehicleLocation) {
            let providerColor = TransportUtil.getTransportColor(location.modeInfo) || black(0);
            return <div style={{
                width: '12px',
                height: '12px',
                ...genStyles.borderRadius(50, '%'),
                background: providerColor,
                border: '2px solid ' + white(0)
            } as any} />
        }
        const modeInfo = location.modeInfo;
        const wantIconForDark = true;
        const wantLocalIcon = !!modeInfo.identifier && modeInfo.identifier.startsWith("me_car-s");
        const transIcon = TransportUtil.getTransIcon(modeInfo,
            {
                isRealtime: false,
                onDark: wantIconForDark,
                useLocal: wantLocalIcon
            });
        let transportColor = TransportUtil.getTransportColor(modeInfo);
        if (transportColor === null) {
            transportColor = wantIconForDark ? black(0) : white(1);
        }
        const transportIconIsRemote = !wantLocalIcon && isRemoteIcon(modeInfo);
        // If the obtained icon changes if we don't prefer remote over appearance mode (dark / light), then it means
        // transIcon is inverted w.r.t. mode.
        const invertedWrtMode = isRemoteIcon(modeInfo);
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
            opacity: getTransIconOpacity(modeInfo, !!this.props.isDarkMode) as any,
            width: '100%',
            height: '100%'
        };
        let icon;
        if (location instanceof FacilityLocation) {
            icon = <TKUIIcon iconName={Util.kebabCaseToCamel(location.facilityType.toLowerCase())} onDark={false} style={imgStyle} />;
            style.background = white();
            style.padding = 0;
        } else if (location instanceof CarParkLocation && (location.carPark.parkingType === "PARK_AND_RIDE" || location.carPark.parkingType === "KISS_AND_RIDE")) {
            icon = <TKUIIcon iconName={Util.kebabCaseToCamel(Util.upperCaseToKebab(location.carPark.parkingType))} onDark={false} style={imgStyle} />;
            style.background = white();
            style.padding = 0;
        } else {
            icon =
                <img
                    src={transIcon}
                    style={imgStyle}
                    aria-hidden={true}
                />
        }
        return (
            <div style={style as any}>
                {icon}
            </div>
        );
    }

}

export default TKUIModeLocationIcon;