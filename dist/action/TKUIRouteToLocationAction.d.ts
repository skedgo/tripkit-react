import * as React from "react";
import { TKUIButtonType } from "../buttons/TKUIButton";
import Location from "../model/Location";
import * as CSS from 'csstype';
interface IProps {
    location?: Location;
    text?: string;
    buttonType?: TKUIButtonType;
    style?: CSS.Properties;
    onClick?: () => void;
}
declare class TKUIRouteToLocationAction extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TKUIRouteToLocationAction;
