import * as React from "react";
import StopLocation from "../model/StopLocation";
import TransportUtil from "../trip/TransportUtil";
import genStyles from "../css/GenStyle.css";
import * as CSS from 'csstype';

interface IProps {
    stop: StopLocation;
    style?: CSS.Properties;
}

class StopIcon extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const modeInfo = this.props.stop.modeInfo;
        const transIcon = TransportUtil.getTransportIcon(modeInfo, false, true);
        let transportColor = TransportUtil.getTransportColor(modeInfo);
        if (transportColor === null) {
            transportColor = "black";
        }
        const remoteIcon = modeInfo.remoteIcon !== undefined;
        const style =
            {
                width: '20px',
                height: '20px',
                padding: remoteIcon ? '1px' : '3px',
                background: remoteIcon ? "white" : transportColor,
                ...genStyles.borderRadius(remoteIcon ? 0 : 50, "%"),
                ...this.props.style
            };
        return (
            <img src={transIcon}
                 style={style}
            />
        );
    }

}

export default StopIcon;