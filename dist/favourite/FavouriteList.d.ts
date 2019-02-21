import * as React from "react";
import './FavouriteList.css';
import FavouriteTrip from "../model/FavouriteTrip";
import { FavouriteRowProps } from "./FavouriteRow";
interface IProps {
    recent?: boolean;
    title?: string;
    previewMax?: number;
    showMax?: number;
    hideWhenEmpty?: boolean;
    onValueClicked?: (value: FavouriteTrip) => void;
    className?: string;
    moreBtnClass?: string;
    renderFavourite?: <P extends FavouriteRowProps>(props: P) => JSX.Element;
}
interface IState {
    values: FavouriteTrip[];
    showAllClicked: boolean;
}
declare class FavouriteList extends React.Component<IProps, IState> {
    private data;
    private favChangeSubscr;
    private rowRefs;
    private focused;
    constructor(props: IProps);
    private onKeyDown;
    private nextIndex;
    render(): React.ReactNode;
    private getDisplayN;
    private getShowUpTo;
    componentDidMount(): void;
    componentWillUnmount(): void;
}
export default FavouriteList;
