import * as React from "react";
import "./FavouriteBtn.css";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
interface IProps {
    favourite?: FavouriteTrip;
}
declare class FavouriteBtn extends React.Component<IProps, {}> {
    render(): React.ReactNode;
    componentDidMount(): void;
}
export declare const TKUIFavQueryBtn: (props: {}) => JSX.Element;
export default FavouriteBtn;
