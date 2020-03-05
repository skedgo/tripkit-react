import * as React from "react";
import {ReactComponent as IconDirections} from '../images/ic-directions.svg';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import Location from "../model/Location";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Util from "../util/Util";
import * as CSS from 'csstype';
import {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";

interface IProps {
    location?: Location;
    text?: string;
    buttonType?: TKUIButtonType;
    style?: CSS.Properties;
    onClick?: () => void;
}

class TKUIRouteToLocationAction extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <RoutingResultsContext.Consumer>
                {(context: IRoutingResultsContext) =>
                    <TKI18nContext.Consumer>
                        {(i18nProps: TKI18nContextProps) =>
                            <TKUIButton
                                type={this.props.buttonType ? this.props.buttonType : TKUIButtonType.PRIMARY}
                                icon={<IconDirections/>}
                                text={this.props.text ? this.props.text : i18nProps.t("Direction")}
                                style={{minWidth: '90px', ...this.props.style}}
                                onClick={() => {
                                    this.props.location &&
                                    context.onQueryChange(Util.iAssign(context.query,
                                        {
                                            from: Location.createCurrLoc(),
                                            to: this.props.location
                                        }));
                                    context.onDirectionsView(true);
                                    this.props.onClick && this.props.onClick();
                                }}
                            />
                        }
                    </TKI18nContext.Consumer>
                }
            </RoutingResultsContext.Consumer>
        );
    }
}

export default TKUIRouteToLocationAction;