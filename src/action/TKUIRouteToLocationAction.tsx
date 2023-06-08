import * as React from "react";
import {ReactComponent as IconDirections} from '../images/ic-directions.svg';
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import Location from "../model/Location";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Util from "../util/Util";
import {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";
import {overrideClass} from "../jss/StyleHelper";

interface IProps {
    location?: Location;
    text?: string;
    buttonType?: TKUIButtonType;
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
                                styles={{
                                    main: overrideClass({
                                        minWidth: '90px'
                                    })
                                }}
                                onClick={() => {
                                    this.props.location &&
                                    context.onQueryChange(Util.iAssign(context.query,
                                        {
                                            from: Location.createCurrLoc(),
                                            to: this.props.location
                                        }));
                                    context.onComputeTripsForQuery(true);
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