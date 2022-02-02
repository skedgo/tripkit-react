import * as React from "react";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Region from "../model/region/Region";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUITransportOptionsViewDefaultStyle } from "./TKUITransportOptionsView.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { Subtract } from "utility-types";
import { CardPresentation, default as TKUICard } from "../card/TKUICard";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import RegionsData from "../data/RegionsData";
import TKUITransportOptionsRow from "./TKUITransportOptionsRow";
import TKUserProfile from "../model/options/TKUserProfile";
import ModeIdentifier from "../model/region/ModeIdentifier";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import HasCard, { HasCardKeys } from "../card/HasCard";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.slideUpOptions | HasCardKeys.cardContainerClass> {
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    region?: Region;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

interface IStyle {
    main: CSSProps<IProps>;
    loadingPanel: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
}

export type TKUITransportOptionsViewProps = IProps;
export type TKUITransportOptionsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITransportOptionsView {...props} />,
    styles: tKUITransportOptionsViewDefaultStyle,
    classNamePrefix: "TKUITransportOptionsView"
};

interface IState {
    update: TKUserProfile;
}

class TKUITransportOptionsView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onRequestClose = this.onRequestClose.bind(this);
        this.state = {
            update: this.props.value
        }
    }

    private onChange(update: TKUserProfile) {
        this.setState({
            update: update
        });
    }

    private onRequestClose() {
        if (this.props.onRequestClose) {
            // Communicate change upwards on close
            this.state.update !== this.props.value && this.props.onChange(this.state.update);
            this.props.onRequestClose();
        }
    }

    public render(): React.ReactNode {
        const region = this.props.region;
        const regionModes = region ? region.modes.concat([ModeIdentifier.WHEELCHAIR_ID]) : undefined;
        const classes = this.props.classes;
        const t = this.props.t;
        return (
            <TKUICard
                title={t("Transport")}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                focusTrap={true}
                onRequestClose={this.onRequestClose}
                slideUpOptions={this.props.slideUpOptions}
                className={this.props.cardContainerClass}
            >
                {!regionModes ?
                    <div className={classes.loadingPanel}>
                        <IconSpin className={classes.iconLoading} focusable="false" />
                    </div>
                    :
                    <div className={classes.main}>
                        {regionModes.map((mode: string, i: number) => {
                            const modeIdentifier = RegionsData.instance.getModeIdentifier(mode)!;
                            return <TKUITransportOptionsRow
                                mode={modeIdentifier}
                                value={this.state.update}
                                onChange={this.onChange}
                                key={i}
                            />
                        })}
                    </div>
                }
            </TKUICard>
        );
    }

}

const Consumer: React.SFC<{ children: (props: IConsumedProps) => React.ReactNode }> = (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <RoutingResultsContext.Consumer>
                    {(routingContext: IRoutingResultsContext) =>
                        props.children!({
                            region: routingContext.region,
                            ...viewportProps
                        })}
                </RoutingResultsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...inputProps, ...consumedProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITransportOptionsView, config, Mapper);