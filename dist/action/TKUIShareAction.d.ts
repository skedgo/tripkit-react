import * as React from "react";
import * as CSS from 'csstype';
import { CardPresentation } from "../card/TKUICard";
interface IProps {
    title: string;
    link: string | (() => Promise<string>);
    message: string;
    vertical?: boolean;
    presentation?: CardPresentation;
    style?: CSS.Properties;
}
declare class TKUIShareAction extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TKUIShareAction;
