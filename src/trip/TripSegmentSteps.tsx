import * as React from "react";
import IconAngleDown from "-!svg-react-loader!../images/ic-angle-down.svg";
import "./TripSegmentSteps.css";

interface IProps<T> {
    steps: T[];
    toggleLabel: (open: boolean) => string;
    leftLabel?: (step: T) => string;
    rightLabel: (step: T) => string;
    borderColor: string;
    dashed?: boolean;
}

interface IState {
    open: boolean;
}

class TripSegmentSteps<T> extends React.Component<IProps<T>, IState> {

    private static count = 0;
    private id: string;

    constructor(props: IProps<T>) {
        super(props);
        this.state = {
            open: false,
        };
        this.id = "trip-segment-steps-" + TripSegmentSteps.count++;
    }

    public render(): React.ReactNode {
        const borderLeftStyle = this.props.dashed ? "dashed" : undefined;
        return (
            <div>
                <div className="gl-flex">
                    <div className="TripSegmentDetail-iconPanel"/>
                    <div className="TripSegmentDetail-linePanel gl-flex gl-center">
                        <div className="TripSegmentDetail-line"
                             style={{
                                 borderColor: this.props.borderColor,
                                 borderLeftStyle: borderLeftStyle
                             }}/>
                    </div>
                    <button className="TripSegmentSteps-stopBtn gl-link"
                            onClick={() => this.setState({open: !this.state.open})}
                            aria-expanded={this.state.open}
                            aria-controls={this.id}
                    >
                        {this.props.toggleLabel(this.state.open)}
                        <IconAngleDown className={"TripSegmentDetail-iconAngleDown" + (this.state.open ? " gl-rotate180" : "")}
                                       focusable="false"
                        />
                    </button>
                </div>
                <div id={this.id} tabIndex={this.state.open ? 0 : -1}>
                    {this.state.open ?
                        this.props.steps.map((step: T, index: number) => {
                            return (
                                <div className="gl-flex" key={index}>
                                    <div className="TripSegmentDetail-timePanel gl-flex">
                                        {this.props.leftLabel ? this.props.leftLabel(step) : ""}
                                    </div>
                                    <div className="TripSegmentDetail-linePanel gl-flex gl-column gl-center gl-align-center">
                                        <div className="TripSegmentDetail-line gl-grow"
                                             style={{
                                                 borderColor: this.props.borderColor,
                                                 borderLeftStyle: borderLeftStyle
                                             }}/>
                                        <div className={"TripSegmentDetail-smallCircle"}
                                             style={{borderColor: this.props.borderColor}}/>
                                        <div className="TripSegmentDetail-line gl-grow"
                                             style={{
                                                 borderColor: this.props.borderColor,
                                                 borderLeftStyle: borderLeftStyle
                                             }}/>
                                    </div>
                                    <div className="TripSegmentDetail-stopTitle">
                                        {this.props.rightLabel(step)}
                                    </div>
                                </div>
                            )}) : null}
                </div>
            </div>
        );
    }
}

export default TripSegmentSteps;