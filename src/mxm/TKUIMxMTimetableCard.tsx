import React, {Fragment} from 'react';
import {overrideClass} from "../jss/StyleHelper";
import Segment from "../model/trip/Segment";
import {CardPresentation} from "../card/TKUICard";
import TKUITimetableView from "../service/TKUITimetableView";
import ServiceResultsProvider, {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKStateController from "../config/TKStateController";

const TKUIMxMTimetableCard: React.SFC<{segment: Segment, onRequestClose: () => void}> = ({segment, onRequestClose}) => {
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
                                        renderHeader: props => <TKUIMxMCardHeader segment={segment} {...props}/>,
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

export default TKUIMxMTimetableCard;