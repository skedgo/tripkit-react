import React from 'react';
import { overrideClass } from "../jss/StyleHelper";
import Segment from "../model/trip/Segment";
import { CardPresentation } from "../card/TKUICard";
import TKUITimetableView, { TKUITimetableViewHelpers } from "../service/TKUITimetableView";
import ServiceResultsProvider, { IServiceResultsContext, ServiceResultsContext } from "../service/ServiceResultsProvider";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKStateController from "../config/TKStateController";

const TKUIMxMTimetableCard: React.FunctionComponent<{ segment: Segment, onRequestClose?: () => void }> = ({ segment, onRequestClose }) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingResultsContext: IRoutingResultsContext) =>
                <ServiceResultsProvider
                    onSegmentServiceChange={routingResultsContext.onSegmentServiceChange}
                >
                    <ServiceResultsContext.Consumer>
                        {(serviceContext: IServiceResultsContext) => (
                            <>
                                <TKUITimetableViewHelpers.TKStateProps>
                                    {({ onFilterChange, onInitTimeChange, ...stateProps }) =>
                                        <TKUITimetableView
                                            {...stateProps}
                                            cardProps={{
                                                title: "Get on service to " + segment.to.getDisplayString(),
                                                subtitle: "From " + segment.from.getDisplayString(),
                                                onRequestClose,
                                                renderHeader: props => <TKUIMxMCardHeader segment={segment} {...props} />,
                                                styles: {
                                                    main: overrideClass({ height: '100%' })
                                                },
                                                presentation: CardPresentation.NONE,
                                                slideUpOptions: {
                                                    showHandle: true
                                                }
                                            }}
                                            showServicesOnHeader={false}
                                            initScrollToNow={false}
                                            actions={() => []}                                            
                                        />}
                                </TKUITimetableViewHelpers.TKStateProps>
                                <TKStateController
                                    onInit={() => serviceContext.onTimetableForSegment(segment)}
                                />
                            </>
                        )}
                    </ServiceResultsContext.Consumer>
                </ServiceResultsProvider>
            }
        </RoutingResultsContext.Consumer>
    );
};

export default TKUIMxMTimetableCard;