import * as React from "react";
import StopLocation from "../model/StopLocation";
import * as CSS from 'csstype';
interface IProps {
    stop: StopLocation;
    style?: CSS.Properties;
}
declare class StopIcon extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default StopIcon;
