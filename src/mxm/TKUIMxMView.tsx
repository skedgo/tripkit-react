import React, {useState, useEffect, Fragment} from 'react';
import {overrideClass, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIMxMViewDefaultStyle} from "./TKUIMxMView.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";
import TKUICardCarousel from "../card/TKUICardCarousel";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {Subtract} from 'utility-types';
import TKUIMxMIndex from "./TKUIMxMIndex";
import Trip from "../model/trip/Trip";
import {Visibility} from "../model/trip/SegmentTemplate";
import Segment from "../model/trip/Segment";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import TKUITimetableView from "../service/TKUITimetableView";
import ServiceResultsProvider, {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {TKStateController} from "../index";
import TKUIServiceSteps from "../trip/TKUIServiceSteps";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {}

interface IConsumedProps extends TKUIViewportUtilProps {
    selectedTrip?: Trip;
    selectedTripSegment?: Segment;
    setSelectedTripSegment: (segment?: Segment) => void;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIMxMViewDefaultStyle>

export type TKUIMxMViewProps = IProps;
export type TKUIMxMViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMView {...props}/>,
    styles: tKUIMxMViewDefaultStyle,
    classNamePrefix: "TKUIMxMView"
};

const MxMTimetableCard: React.SFC<{segment: Segment, onRequestClose: () => void}> = ({segment, onRequestClose}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingResultsContext: IRoutingResultsContext) =>
                <ServiceResultsProvider
                    onSegmentServiceChange={routingResultsContext.onSegmentServiceChange}
                >
                    <ServiceResultsContext.Consumer>
                        {(serviceContext: IServiceResultsContext) => (
                            <Fragment>
                                <TKUITimetableView
                                    cardProps={{
                                        title: "Get on service to " + segment.to.getDisplayString(),
                                        subtitle: "From " + segment.from.getDisplayString(),
                                        onRequestClose: onRequestClose,
                                        styles: {
                                            main: overrideClass({height: '100%'})
                                        },
                                        presentation: CardPresentation.NONE
                                    }}
                                    showSearch={false}
                                />
                                <TKStateController
                                    onInit={() => serviceContext.onTimetableForSegment(segment)}
                                />
                            </Fragment>
                        )}
                    </ServiceResultsContext.Consumer>
                </ServiceResultsProvider>
            }
        </RoutingResultsContext.Consumer>
    );
};

function getPTSegmentMxMCards(segment: Segment, onClose: () => void): JSX.Element[] {
    let cards: JSX.Element[] = [];
    cards.push(
        <MxMTimetableCard segment={segment} onRequestClose={onClose} key={segment.id + "a"}/>
    );
    const timezone = segment.from.timezone;
    cards.push(
        <TKUICard
            title={segment.getAction()}
            subtitle={segment.to.getDisplayString()}
            onRequestClose={onClose}
            styles={{
                main: overrideClass({ height: '100%'})
            }}
            key={segment.id + "b"}
        >
            {segment.shapes &&
            <TKUIServiceSteps
                steps={segment.shapes}
                serviceColor={segment.getColor()}
                timezone={timezone}
            />}
        </TKUICard>
    );
    return cards;
}

function getSegmentMxMCards(segment: Segment, onClose: () => void): JSX.Element[] {
    if (segment.isPT()) {
        return getPTSegmentMxMCards(segment, onClose);
    } else {
        return ([
            <TKUICard
                title={segment.getAction()}
                subtitle={segment.to.getDisplayString()}
                onRequestClose={onClose}
                styles={{
                    main: overrideClass({ height: '100%'})
                }}
            >
                <div style={{height: '100%'}}/>
            </TKUICard>
        ]);
    }
}

function buildSegmentCardsMap(segments: Segment[], onClose: () => void): Map<Segment, JSX.Element[]> {
    return segments.reduce((map: Map<Segment, JSX.Element[]>, segment: Segment) => {
        map.set(segment, getSegmentMxMCards(segment, onClose));
        return map;
    }, new Map<Segment, JSX.Element[]>());
}

/**
 * Gets the index in the carousel of the first card for the segment.
 */
const cardIndexForSegment = (segment: Segment, segments: Segment[], map: Map<Segment, JSX.Element[]>) =>
    segments.slice(0, segments.indexOf(segment))    // exclude segment since should count up to the previous one.
        .reduce((cardIndex, segment) => cardIndex + map.get(segment)!.length, 0);

/**
 * Maps the card index in the carousel to the associated segment (this is not a one-to-one correspondence given
 * some segments have 2 or more cards, as PT and Collect segments).
 */
const cardIndexToSegment = (cardIndex: number, segments: Segment[], map: Map<Segment, JSX.Element[]>) =>
    cardIndex < map.get(segments[0])!.length ? segments[0] :
        cardIndexToSegment(cardIndex - map.get(segments[0])!.length, segments.slice(1), map);

/**
 * Gets the first segment in segments, from the selected one, that is visible in summary.
 */
const findNextInSummary = (selectedSegment: Segment, segments: Segment[]): Segment =>
    segments.slice(segments.indexOf(selectedSegment))
        .find(segment => segment.hasVisibility(Visibility.IN_SUMMARY))!;

const TKUIMxMView: React.SFC<IProps> = (props: IProps) => {
    const trip = props.selectedTrip!;
    const segments = trip.getSegments();
    const segmentsInSummary = trip.getSegments(Visibility.IN_SUMMARY);
    // Evaluate if building the map on each render is too inefficient, and if so store on field and just
    // update if trip changes (including trip alternative).
    const segmentToCards = buildSegmentCardsMap(segments, () => props.setSelectedTripSegment(undefined));
    const classes = props.classes;
    const selectedSegment = props.selectedTripSegment!;
    // A not-in-summary segment (e.g. a wait segment) is mapped to the next segment in the trip that is in summary.
    const selectedSegmentInSummary = findNextInSummary(selectedSegment, segments);
    const selectedIndexInSummary = segmentsInSummary.indexOf(selectedSegmentInSummary);
    // Since a segment may have 2 or more cards (e.g. PT or Collect segments), we use this offset to keep track of
    // which of the cards of the segment is currently visible in the cards carousel.
    const [selectedCardOffset, setSelectedCardOffset] = useState<number>(0);
    // Index of selected card in carousel.
    const selectedCardIndex = cardIndexForSegment(selectedSegment, segments, segmentToCards) + selectedCardOffset;
    return (
        <Fragment>
            <div className={classes.trackIndexPanel}>
                <TKUIMxMIndex
                    segments={segmentsInSummary}
                    value={selectedIndexInSummary}
                    onChange={(value: number) => {
                        props.setSelectedTripSegment(segmentsInSummary[value]);
                        // reset card offset since changed to another in-summary segment.
                        setSelectedCardOffset(0);
                    }}
                />
            </div>
            <TKUICardCarousel
                selected={selectedCardIndex}
                onChange={(selectedCardIndex) => {
                    const segment = cardIndexToSegment(selectedCardIndex, segments, segmentToCards);
                    props.setSelectedTripSegment(segment);
                    setSelectedCardOffset(selectedCardIndex - cardIndexForSegment(segment, segments, segmentToCards));
                }}
                slideUpOptions={{
                    position: props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    modalDown: {top: (window as any).document.body.offsetHeight - 200, unit: 'px'},
                    modalUp: {top: 100, unit: 'px'},
                    draggable: false
                }}
                showControls={true}
                // parentElement={this.ref}
            >
                {segments.reduce((cards, segment) => cards.concat(segmentToCards.get(segment)!), [] as JSX.Element[])}
            </TKUICardCarousel>
        </Fragment>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <RoutingResultsContext.Consumer>
            {(routingResultsContext: IRoutingResultsContext) =>
                <TKUIViewportUtil>
                    {(viewportProps: TKUIViewportUtilProps) => {
                        const {selectedTrip, selectedTripSegment, setSelectedTripSegment} = routingResultsContext;
                        return children!({...inputProps, ...viewportProps, selectedTrip, selectedTripSegment, setSelectedTripSegment});
                    }}
                </TKUIViewportUtil>
            }
        </RoutingResultsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUIMxMView, config, Mapper);