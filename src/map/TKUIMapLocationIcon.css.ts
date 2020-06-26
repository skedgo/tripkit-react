import {TKUIMapLocationIconProps, TKUIMapLocationIconStyle} from "./TKUIMapLocationIcon";
import {black, TKUITheme, white} from "../jss/TKUITheme";
import TransportUtil from "../trip/TransportUtil";
import StopLocation from "../model/StopLocation";
import {TKUIStyles} from "../jss/StyleHelper";
import ModeInfo from "../model/trip/ModeInfo";

export function isRemoteIcon(modeInfo: ModeInfo): boolean {
    return modeInfo.remoteIcon !== undefined || modeInfo.remoteDarkIcon !== undefined;
}

export function getTransIconOpacity(modeInfo: ModeInfo, isDarkMode: boolean): string | undefined {
    return (isDarkMode && !isRemoteIcon(modeInfo)) ? '.7' : undefined;
}

export const tKUIMapLocationIconDefaultStyle: TKUIStyles<TKUIMapLocationIconStyle, TKUIMapLocationIconProps> =
    (theme: TKUITheme) => {
            return ({
                main: {},
                iconPin: {
                    width: '26px',
                    height: '39px',
                    '& path': {
                        fill: (props: TKUIMapLocationIconProps) => {
                            const location = props.location;
                            let iconPinColor = props.from ? theme.colorPrimary : theme.colorError;
                            if (location instanceof StopLocation) {
                                let transportColor = TransportUtil.getTransportColor(location.modeInfo);
                                if (transportColor === null) {
                                    transportColor = black(0);
                                }
                                iconPinColor = transportColor;
                            }
                            return iconPinColor;
                        },
                        stroke: (props: TKUIMapLocationIconProps) => {
                            // Put stroke just if theme is dark, to separate from background (dark map)
                            const location = props.location;
                            return (location instanceof StopLocation && theme.isDark) ? white(1) : undefined;
                        }
                    },
                },
                icon: {
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    height: '26px',
                    width: '26px',
                    padding: '4px',
                    '& img': {
                        width: '100%',
                        height: '100%',
                        opacity: (props: TKUIMapLocationIconProps) => props.location instanceof StopLocation ?
                            getTransIconOpacity(props.location.modeInfo, props.theme.isDark) : undefined
                    }
                },
                iconInverted: {
                    padding: '5px',
                    '& img': {
                        // Icon is inverted w.r.t. what we wanted, which is always "for Dark", so got "for light",
                        // so need light background.
                        background: white(0),
                        border: '1px solid ' + white(2)
                    }
                },
                clickAndHold: {
                    '& img': {
                        display: 'none'
                    }
                }
            })
};