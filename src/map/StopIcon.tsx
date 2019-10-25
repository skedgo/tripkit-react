import * as React from "react";
import StopLocation from "../model/StopLocation";
import TransportUtil from "../trip/TransportUtil";
import genStyles from "../css/GenStyle.css";

interface IProps {
    stop: StopLocation;
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
        return (
            <img src={transIcon}
                 style={{
                     width: '20px',
                     height: '20px',
                     padding: remoteIcon ? '1px' : '3px',
                     background: remoteIcon ? "white" : transportColor,
                     ...genStyles.borderRadius(remoteIcon ? 0 : 50, "%")
                 }}
            />
        );
    }

}

export default StopIcon;