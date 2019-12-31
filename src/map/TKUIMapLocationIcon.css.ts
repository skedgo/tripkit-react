import {TKUIMapLocationIconProps, TKUIMapLocationIconStyle} from "./TKUIMapLocationIcon";
import {TKUITheme} from "../jss/TKUITheme";
import TransportUtil from "../trip/TransportUtil";
import StopLocation from "../model/StopLocation";

export const tKUIMapLocationIconDefaultStyle: (theme: TKUITheme) => (props: TKUIMapLocationIconProps) => TKUIMapLocationIconStyle =
    (theme: TKUITheme) =>
        (props: TKUIMapLocationIconProps) => {
            const location = props.location;
            let iconPinColor = props.from ? theme.colorPrimary : theme.colorError;
            if (location instanceof StopLocation) {
                const transportColor = TransportUtil.getTransportColor(location.modeInfo);
                const remoteIcon = location.modeInfo.remoteIcon !== undefined;
                iconPinColor = remoteIcon ? "white" : (transportColor || "black");
            }
            return ({
                main: {},
                iconPin: {
                    width: '26px',
                    height: '39px',
                    color: iconPinColor
                },
                icon: {
                    position: 'absolute',
                    left: '0',
                    height: '26px',
                    width: '26px',
                    padding: '4px'
                }
            });
        };