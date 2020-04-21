import * as React from "react";
import { Moment } from "moment-timezone";
import "./DaySeparator.css";
interface IProps {
    date: Moment;
    scrollRef?: any;
}
interface IState {
    showOnTop: boolean;
}
declare class DaySeparator extends React.Component<IProps, IState> {
    private ref;
    private hasScrollHandler;
    constructor(props: IProps);
    render(): React.ReactNode;
    private scrollHandler?;
    componentDidMount(): void;
    componentWillUnmount(): void;
}
export default DaySeparator;
