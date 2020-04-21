import * as React from "react";
import { TKUICardClientProps } from "./TKUICard";
interface IProps {
    children: (renderCard: (props: TKUICardClientProps, id: any) => void) => React.ReactNode;
}
interface IState {
    props: TKUICardClientProps;
}
declare class TKUIRendersCard extends React.Component<IProps, IState> {
    render(): React.ReactNode;
}
export default TKUIRendersCard;
