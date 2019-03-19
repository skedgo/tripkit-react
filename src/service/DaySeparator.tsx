import * as React from "react";
import {Moment} from "moment-timezone";
import "./DaySeparator.css";

interface IProps {
    date: Moment;
    key: string;
    atTop?: boolean;
    scrollTop?: number;
}

class DaySeparator extends React.Component<IProps, {}> {

    private ref: any;

    public render(): React.ReactNode {
        const showOnTop = this.props.scrollTop !== undefined && this.ref
            && (this.props.scrollTop >= this.ref.offsetTop);
        return (
            [
                <div className={"DaySeparator" + (!showOnTop ? " DaySeparator-rise" : "")} key={this.props.key + "-1"}
                     ref={(ref: any) => this.ref = ref}
                >
                    {this.props.date.format("ddd D")}
                </div>,
                showOnTop && <div className="DaySeparator DaySeparator-top" key={this.props.key + "-2"}>
                    {this.props.date.format("ddd D")}
                </div>
            ]
        );
    }
}

export default DaySeparator;