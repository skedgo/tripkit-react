import * as React from "react";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import "./MapLocationPopup.css";
interface IProps {
    value: RealTimeVehicle;
    title: string;
}
interface IState {
    secsOld: number;
}
declare class TKUIRealtimeVehiclePopup extends React.Component<IProps, IState> {
    private ageInterval;
    constructor(props: IProps);
    render(): React.ReactNode;
    componentDidMount(): void;
    private refreshAge;
    componentWillUnmount(): void;
}
export default TKUIRealtimeVehiclePopup;
