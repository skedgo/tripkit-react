import {TKUIMapLocationIconProps, TKUIMapLocationIconStyle} from "./TKUIMapLocationIcon";
import {TKUITheme} from "../jss/TKUITheme";
import TransportUtil from "../trip/TransportUtil";
import StopLocation from "../model/StopLocation";
import {TKUIStyles} from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";

export const tKUIMapLocationIconDefaultStyle: TKUIStyles<TKUIMapLocationIconStyle, TKUIMapLocationIconProps> =
    (theme: TKUITheme) => {
            return ({
                main: {},
                iconPin: {
                    width: '26px',
                    height: '39px',
                    color: (props: TKUIMapLocationIconProps) => {
                        const location = props.location;
                        let iconPinColor = props.from ? theme.colorPrimary : theme.colorError;
                        if (location instanceof StopLocation) {
                            const transportColor = TransportUtil.getTransportColor(location.modeInfo);
                            const remoteIcon = location.modeInfo.remoteIcon !== undefined;
                            iconPinColor = remoteIcon ? "white" : (transportColor || "black");
                        }
                        return iconPinColor;
                    },
                    ...genStyles.svgFillCurrColor
                },
                icon: {
                    position: 'absolute',
                    left: '0',
                    height: '26px',
                    width: '26px',
                    padding: '4px'
                }
            })
};