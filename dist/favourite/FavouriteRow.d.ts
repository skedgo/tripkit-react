import * as React from "react";
import './FavouriteRow.css';
import FavouriteTrip from "../model/FavouriteTrip";
interface IProps {
    favourite: FavouriteTrip;
    recent?: boolean;
    onClick?: () => void;
    onKeyDown?: (e: any) => void;
    onFocus?: (e: any) => void;
}
declare class FavouriteRow extends React.Component<IProps, {}> {
    private ref;
    constructor(props: IProps);
    focus(): void;
    render(): React.ReactNode;
}
export default FavouriteRow;
