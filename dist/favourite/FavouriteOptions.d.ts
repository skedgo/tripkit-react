import * as React from "react";
import FavouriteTrip from "../model/FavouriteTrip";
import Region from "../model/region/Region";
import "./FavouriteOptions.css";
interface IProps {
    favourite: FavouriteTrip;
}
interface IState {
    region?: Region;
}
declare class FavouriteOptions extends React.Component<IProps, IState> {
    constructor(props: Readonly<IProps>);
    render(): React.ReactNode;
    componentDidMount(): void;
}
export default FavouriteOptions;
