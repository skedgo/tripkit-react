import * as React from "react";
import Tooltip from "rc-tooltip";
import {ReactComponent as IconFeedback} from '../images/ic-feedback.svg';
import copy from 'copy-to-clipboard';
import OptionsData from "../data/OptionsData";
import Util from "../util/Util";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import {TKState, default as TKStateConsumer} from "../config/TKStateConsumer";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {tKUIReportBtnDefaultStyle} from "./TKUIReportBtn.css";
import classNames from "classnames";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    className?: string;
    tooltipClassName?: string;
    onClick?: (state: TKState) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IConsumedProps {
    tKState: TKState;
}

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIReportBtnProps = IProps;
export type TKUIReportBtnStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIReportBtn {...props}/>,
    styles: tKUIReportBtnDefaultStyle,
    classNamePrefix: "TKUIReportBtn"
};

interface IState {
    feedbackTooltip: boolean;
}

export function feedbackTextFromState(state: TKState): string {
    const optionsJson = Util.serialize(OptionsData.instance.get());
    const location = window.location;
    const plannerUrl = location.protocol + "//" + location.hostname
        + (location.port ? ":" + location.port : "") + location.pathname;
    return "webapp url: " + encodeURI(state.routingQuery.getGoUrl(plannerUrl)) + "\n\n"
        + "options: " + JSON.stringify(optionsJson) + "\n\n"
        + "satapp url: " +  (state.selectedTrip ? state.selectedTrip.satappQuery : "") + "\n\n"
        + "trip url: " +  (state.selectedTrip ? state.selectedTrip.temporaryURL : "");
}

class TKUIReportBtn extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            feedbackTooltip: false
        };
    }

    public render(): React.ReactNode {
        const onClick = this.props.onClick ? this.props.onClick :
            (state: TKState) => {
                copy(feedbackTextFromState(state));
                this.setState({feedbackTooltip: true});
                setTimeout(() => this.setState({feedbackTooltip: false}), 3000);
            };
        return (
            <Tooltip
                overlay={"Feedback info copied to clipboard"}
                placement={"left"}
                overlayClassName={this.props.tooltipClassName}
                visible={this.state.feedbackTooltip}
            >
                <IconFeedback className={classNames(this.props.className, this.props.classes.main)}
                     onClick={() => onClick(this.props.tKState)}
                     aria-hidden={true}
                     tabIndex={0}
                />
            </Tooltip>
        );
    }

    public componentDidUpdate(prevProps: IProps) {
        // TODO: Maybe create a separate non-displayable component called TKTracker that tracks app state and user
        // interaction, either hitting a tracking endpoint (e.g. for planned trips) or storing that info in local
        // storage to (possibly) be queried by feedback button.
        if (this.props.tKState.selectedTrip !== prevProps.tKState.selectedTrip) {
            PlannedTripsTracker.instance.selected = this.props.tKState.selectedTrip;
            PlannedTripsTracker.instance.scheduleTrack(true);
        }

        if (this.props.tKState.trips !== prevProps.tKState.trips) {
            PlannedTripsTracker.instance.trips = this.props.tKState.trips;
        }
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <TKStateConsumer>
            {(state: TKState) =>
                props.children!({tKState: state})}
        </TKStateConsumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIReportBtn, config, Mapper);