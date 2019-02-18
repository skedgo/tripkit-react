import React, { Component } from "react";
import Location from "../model/Location";
import './ResultItem.css';
interface IProps {
    location: Location;
    highlighted: boolean;
    ariaSelected?: boolean;
    key: number;
    onClick?: () => void;
    id?: string;
}
declare class ResultItem extends Component<IProps, {}> {
    render(): React.ReactNode;
}
export default ResultItem;
