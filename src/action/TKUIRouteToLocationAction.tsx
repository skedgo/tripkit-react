import * as React from "react";
import {ReactComponent as IconDirections} from '../images/ic-directions.svg';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import Location from "../model/Location";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Util from "../util/Util";
import * as CSS from 'csstype';

interface IProps {
    location: Location;
    text?: string;
    vertical?: boolean;
    style?: CSS.Properties;
}

class TKUIRouteToLocationAction extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <RoutingResultsContext.Consumer>
                {(context: IRoutingResultsContext) =>
                    <TKUIButton
                        type={this.props.vertical ? TKUIButtonType.PRIMARY_VERTICAL : TKUIButtonType.PRIMARY}
                        icon={<IconDirections/>}
                        text={this.props.text ? this.props.text : "Direction"}
                        style={{minWidth: '90px', ...this.props.style}}
                        onClick={() => {
                            context.onQueryChange(Util.iAssign(context.query,
                                {
                                    // from: context.query.from ||
                                    to: this.props.location
                                }));
                        }}
                    />}
            </RoutingResultsContext.Consumer>
        );
    }
}

export default TKUIRouteToLocationAction;