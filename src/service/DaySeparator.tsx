import * as React from "react";
import {Moment} from "moment-timezone";
import "./DaySeparator.css";

interface IProps {
    date: Moment;
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
                <div className={"DaySeparator" + (!showOnTop ? " DaySeparator-rise" : "")}
                     key={"DaySeparator-1"}
                     ref={(ref: any) => this.ref = ref}
                >
                    {this.props.date.format("ddd D")}
                </div>,
                showOnTop && <div className="DaySeparator DaySeparator-top"
                                  key={"DaySeparator-2"}
                >
                    {this.props.date.format("ddd D")}
                </div>
            ]
        );
    }
}

export default DaySeparator;