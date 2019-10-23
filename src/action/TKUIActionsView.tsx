import * as React from "react";
import TKUIAction from "./TKUIAction";
import TKUIActionView from "./TKUIActionView";
import genStyles from "../css/GenStyle.css";

interface IProps {
    actions: TKUIAction[];
}

class TKUIActionsView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <div style={{...genStyles.flex, marginTop: '15px', ...genStyles.spaceAround}}>
                {this.props.actions.map((action: TKUIAction, i: number) => <TKUIActionView action={action} key={i}/>)}
            </div>
        );
    }

}

export default TKUIActionsView;