import * as React from "react";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import genStyles from "../css/GenStyle.css";
import DateTimeUtil from "../util/DateTimeUtil";
import {tKUIColors} from "../jss/TKUITheme";

interface IProps {
    value: RealTimeVehicle;
    title: string;
}

interface IState {
    secsOld: number
}

class TKUIRealtimeVehiclePopup extends React.Component<IProps, IState> {

    private ageInterval: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            secsOld: 0
        }
    }

    public render(): React.ReactNode {
        const title = this.props.title.charAt(0).toUpperCase() + this.props.title.substring(1);
        const text = "Updated " + this.state.secsOld + "s ago";
        return (
            <div style={{...genStyles.flex, ...genStyles.column, ...genStyles.center, ...genStyles.fontM,
                     padding: '5px 10px'}}
            >
                {title}
                <div style={{
                    ...genStyles.fontSM,
                    color: tKUIColors.black1,
                    whiteSpace: 'nowrap'
                }}>
                    {text}
                </div>
            </div>
        );
    }

    public componentDidMount() {
        this.ageInterval = setInterval(() => this.refreshAge(), 1000);
        this.refreshAge();
    }

    private refreshAge() {
        this.setState({
            secsOld: Math.floor((DateTimeUtil.getNow().valueOf() / 1000 - this.props.value.lastUpdate))
        });
    }

    public componentWillUnmount() {
        clearInterval(this.ageInterval);
    }
}

export default TKUIRealtimeVehiclePopup;