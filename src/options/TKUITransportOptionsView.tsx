import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import TKTransportOptions, {DisplayConf} from "../model/options/TKTransportOptions";
import Region from "../model/region/Region";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUITransportOptionsViewDefaultStyle} from "./TKUITransportOptionsView.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import Util from "../util/Util";
import {IOptionsContext, OptionsContext} from "./OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {Subtract} from "utility-types";
import {CardPresentation, default as TKUICard} from "../card/TKUICard";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import RegionsData from "../data/RegionsData";
import TKUITransportOptionsRow from "./TKUITransportOptionsRow";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onClose?: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    region?: Region;
    value: TKTransportOptions,
    onChange: (value: TKTransportOptions) => void
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
}

export type TKUITransportOptionsViewProps = IProps;
export type TKUITransportOptionsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITransportOptionsView {...props}/>,
    styles: tKUITransportOptionsViewDefaultStyle,
    classNamePrefix: "TKUITransportOptionsView"
};

class TKUITransportOptionsView extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    private close() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private onChange(mode: string, value: DisplayConf) {
        const transOptions = Util.deepClone(this.props.value);
        transOptions.setTransportOption(mode, value);
        this.props.onChange(transOptions);
    }

    public render(): React.ReactNode {
        const region = this.props.region;
        if (!region) {
            return null;
        }
        const transOptions = this.props.value;
        const classes = this.props.classes;
        return (
            <TKUICard
                title={"Transport"}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                onRequestClose={() => this.close()}
            >
                <div className={classes.main}>
                    {region.modes.map((mode: string, index: number) => {
                            const modeOption = transOptions.getTransportOption(mode);
                            const modeIdentifier = RegionsData.instance.getModeIdentifier(mode)!;
                            return <TKUITransportOptionsRow
                                value={modeOption}
                                onChange={(value: DisplayConf) => this.onChange(mode, value)}
                                mode={modeIdentifier}
                            />
                        }
                    )}
                </div>
            </TKUICard>
        );
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) =>
                        <RoutingResultsContext.Consumer>
                            {(routingContext: IRoutingResultsContext) =>
                                props.children!({
                                    value: optionsContext.value.transportOptions,
                                    onChange: (value: TKTransportOptions) => {
                                        const newValue = Util.iAssign(optionsContext.value, {transportOptions: value});
                                        optionsContext.onChange(newValue);
                                    },
                                    region: routingContext.region,
                                    ...viewportProps
                                })}
                        </RoutingResultsContext.Consumer>
                    }
                </OptionsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITransportOptionsView, config, Mapper);