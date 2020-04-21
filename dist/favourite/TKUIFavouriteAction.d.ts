import * as React from "react";
import Favourite from "../model/favourite/Favourite";
import * as CSS from 'csstype';
interface IProps {
    favourite: Favourite;
    vertical?: boolean;
    style?: CSS.Properties;
}
declare class TKUIFavouriteAction extends React.Component<IProps, {}> {
    constructor(props: IProps);
    private renderIcon;
    private onClick;
    render(): JSX.Element;
    private exists;
}
export default TKUIFavouriteAction;
