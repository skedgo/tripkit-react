import * as React from "react";
import {
    IServiceResultsContext,
    ServiceResultsContext
} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import ITKUIServiceDepartureRowProps from "./ITKUIServiceDepartureRowProps";
import {ReactComponent as IconGlass} from "../images/ic-glass.svg";
import {ReactComponent as IconClock} from "../images/ic-clock.svg";
import {ChangeEvent} from "react";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";
import {Moment} from "moment";
import TKUICard from "../card/TKUICard";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconDirections} from '../images/ic-directions.svg';
import {ReactComponent as IconFavorite} from '../images/ic-star-filled.svg';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import {CSSProps, withStyleProp} from "../jss/StyleHelper";
import {tKUITimetableDefaultStyle} from "./TKUITimetableView.css";
import {ClassNameMap} from "react-jss";
import DateTimePickerFace from "../time/DateTimePickerFace";

interface ITKUITimetableViewProps {
    onRequestClose?: () => void;
    styles?: ITKUITimetableViewStyle;
}

export interface IProps extends IServiceResultsContext, ITKUITimetableViewProps {
    classes: ClassNameMap<keyof ITKUITimetableViewStyle>
}

export interface ITKUITimetableViewStyle {
    main: CSSProps<IProps>;
    listPanel: CSSProps<IProps>;
    containerPanel: CSSProps<IProps>;
    buttonsPanel: CSSProps<IProps>;
    secondaryBar: CSSProps<IProps>;
    filterPanel: CSSProps<IProps>;
    glassIcon: CSSProps<IProps>;
    filterInput: CSSProps<IProps>;
    faceButtonClass: CSSProps<IProps>;
    dapartureRow: CSSProps<IProps>;
}

class TKUITimetableViewConfig {
    public styles: ITKUITimetableViewStyle = tKUITimetableDefaultStyle;
    public renderDeparture: <P extends ITKUIServiceDepartureRowProps>(departureProps: P) => JSX.Element
        = <P extends ITKUIServiceDepartureRowProps>(props: P) => <TKUIServiceDepartureRow {...props}/>;

    public static instance = new TKUITimetableViewConfig();
}

class TKUITimetableView extends React.Component<IProps, {}> {

    private scrollRef: any;

    constructor(props: IProps) {
        super(props);
        if (props.onRequestMore) {
            props.onRequestMore();
        }
        this.onScroll = this.onScroll.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
    }

    private onScroll(e: any) {
        const scrollPanel = e.target;
        if (this.props.onRequestMore && scrollPanel.scrollTop + scrollPanel.clientHeight > scrollPanel.scrollHeight - 30) {
            this.props.onRequestMore();
        }
    }

    private onFilterChange(e: ChangeEvent<HTMLInputElement>) {
        if (this.props.onFilterChange) {
            this.props.onFilterChange(e.target.value)
        }
    }

    public render(): React.ReactNode {
        const stop = this.props.stop;
        const parentStopMode = stop && stop.class === "ParentStopLocation" && stop.modeInfo && stop.modeInfo.alt;
        const subtitle = parentStopMode ? parentStopMode.charAt(0).toUpperCase() + parentStopMode.slice(1) + " station"
            : undefined;
        const classes = this.props.classes;
        return (
            <TKUICard
                title={this.props.title}
                subtitle={subtitle}
                renderSubHeader={() =>
                    <div className={classNames(classes.buttonsPanel, genStyles.flex, genStyles.spaceBetween)}>
                        <TKUIButton
                            text={"Direction"}
                            icon={<IconDirections/>}
                        />
                        <TKUIButton
                            text={"Favorite"}
                            icon={<IconFavorite/>}
                            type={TKUIButtonType.SECONDARY}
                        />
                    </div>
                }
                onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>
                    <div className={classes.secondaryBar}>
                        <div className={classes.filterPanel}>
                            <IconGlass className={classes.glassIcon}/>
                            <input className={classes.filterInput} placeholder="Filter"
                                   onChange={this.onFilterChange}/>
                        </div>
                        <DateTimePickerFace
                            value={this.props.initTime}
                            onChange={this.props.onInitTimeChange}
                            renderFaceButton={(value: Moment, onClick: (e: any) => void, onFocus: (e: any) => void) => {
                                return (
                                    <button
                                        onClick={onClick}
                                        onFocus={onFocus}
                                        className={classes.faceButtonClass}
                                    >
                                        <IconClock/>
                                    </button>
                                )
                            }}
                        />
                    </div>
                    <div className={classes.listPanel}>
                        <div className={classes.containerPanel}
                             onScroll={this.onScroll}
                             ref={(scrollRef: any) => this.scrollRef = scrollRef}
                        >
                            {this.props.departures.reduce((elems: JSX.Element[], departure: ServiceDeparture, i: number) => {
                                const showDayLabel = i === 0 ||
                                    DateTimeUtil.momentTZTime(this.props.departures[i - 1].actualStartTime * 1000).format("ddd D") !==
                                    DateTimeUtil.momentTZTime(departure.actualStartTime * 1000).format("ddd D");
                                if (showDayLabel) {
                                    elems.push(<DaySeparator date={DateTimeUtil.momentTZTime(departure.actualStartTime * 1000)}
                                                             key={"day-" + i}
                                                             scrollRef={this.scrollRef}
                                    />)
                                }
                                elems.push(<div className={classes.dapartureRow}>
                                    {TKUITimetableViewConfig.instance.renderDeparture({
                                        value: departure,
                                        key: i,
                                        onClick: () => {
                                            if (this.props.onServiceSelection) {
                                                this.props.onServiceSelection(departure)
                                            }
                                        }
                                    })}
                                </div>);
                                return elems;
                            }, [])}
                        </div>
                    </div>
                </div>
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.departures.length === 0 && this.props.departures.length > 0) {
            const now = DateTimeUtil.getNow().valueOf()/1000;
            const nextDepartureIndex = this.props.departures.findIndex((departure: ServiceDeparture) => {
                return departure.actualStartTime >= now;
            });
            console.log("nextDepartureIndex: " + nextDepartureIndex);
            if (nextDepartureIndex !== -1 && this.scrollRef) {
                Array.prototype.slice.call(this.scrollRef.children).filter((child: any) =>
                    !child.className.includes("DaySeparator")
                )[nextDepartureIndex].scrollIntoView();
            }
        }
    }

}

const Consumer: React.SFC<{children: (props: IServiceResultsContext) => React.ReactNode}> = (props: {children: (props: IServiceResultsContext) => React.ReactNode}) => {
    return (
        <ServiceResultsContext.Consumer>
            {(serviceContext: IServiceResultsContext) => (
                props.children!(serviceContext)
            )}
        </ServiceResultsContext.Consumer>
    );
};

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUITimetableView");
    return (props: ITKUITimetableViewProps) =>
        <Consumer>
            {(cProps: IServiceResultsContext) => {
                const stylesToPass = props.styles || TKUITimetableViewConfig.instance.styles;
                return <RawComponentStyled {...props} {...cProps} styles={stylesToPass}/>;
            }}
        </Consumer>;
};

export default Connect(TKUITimetableView);