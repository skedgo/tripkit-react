import * as React from "react";
import "./FavouriteBtn.css";
import FavouriteTrip from "../model/FavouriteTrip";
interface IProps {
    favourite: FavouriteTrip | null;
}
declare class FavouriteBtn extends React.Component<IProps, {}> {
    constructor(props: IProps);
    render(): React.ReactNode;
    componentDidMount(): void;
}
export default FavouriteBtn;
