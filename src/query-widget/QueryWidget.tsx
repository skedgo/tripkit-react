import * as React from 'react';
import './QueryWidget.css';
import QueryInput from "../query/QueryInput";
import '../css/global.css';
import '../css/device.css';
import IconStarFilled from "-!svg-react-loader!../images/ic-star-filled.svg";
import IconNpMap from "-!svg-react-loader!../images/ic-np_map.svg";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import FavouriteTrip from "../model/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import RoutingQuery from "../model/RoutingQuery";
import FavouriteList from "../favourite/FavouriteList";
import FavouriteBtn from "../favourite/FavouriteBtn";
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
import OptionsView from "../options/OptionsView";
import Modal from 'react-modal';
import OptionsData from "../data/OptionsData";
import Options from "../model/Options";
import Util from "../util/Util";
import Region from "../model/region/Region";
import BBox from "../model/BBox";
import TPlannerDisclaimer from "./TPlannerDisclaimer";
import WaiAriaUtil from "../util/WaiAriaUtil";
import GATracker from "../analytics/GATracker";

interface IProps {
    plannerUrl?: string;
}

interface IState {
    selectedTab: TabView;
    routingQuery: RoutingQuery;
    showOptions: boolean;
    queryInputBounds?: BBox;
    queryInputFocusLatLng?: LatLng;
}

enum TabView {
    PLANNER = "PLANNER",
    FAVOURITES = "FAVOURITES"
}

class QueryWidget extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.onTabClicked = this.onTabClicked.bind(this);
        this.state = {
            selectedTab: TabView.PLANNER,
            routingQuery: RoutingQuery.create(),
            showOptions: false,
            // TODO: Hardcode ACT bounding box to initalize, but not necessary (can leave undefined)
            queryInputBounds: BBox.createBBox(LatLng.createLatLng(-34.37701,149.852),
                LatLng.createLatLng(-35.975,148.674)),
            queryInputFocusLatLng: LatLng.createLatLng(-35.3, 149.1)
        };

        WaiAriaUtil.addTabbingDetection();

        this.onGoClicked = this.onGoClicked.bind(this);
        this.onFavClicked = this.onFavClicked.bind(this);
        this.onShowOptions = this.onShowOptions.bind(this);
        this.onOptionsChange = this.onOptionsChange.bind(this);
        this.onModalRequestedClose = this.onModalRequestedClose.bind(this);
    }

    private onTabClicked(e: any) {
        this.setState({selectedTab: e.target.name});
    }

    /**
     * Not triggered by QueryInput if not complete.
     */
    private onGoClicked() {
        // Need to check not null again to avoid error
        if (this.state.routingQuery.from !== null && this.state.routingQuery.to !== null) {
            FavouritesData.recInstance.add(FavouriteTrip.create(this.state.routingQuery.from, this.state.routingQuery.to));
        }
        window.open(this.state.routingQuery.getGoUrl(this.props.plannerUrl),'_blank');
    }

    private onFavClicked(favourite: FavouriteTrip) {
        const query = RoutingQuery.create(favourite.from, favourite.to);
        this.setState({
            routingQuery: query
        }, () => window.open(this.state.routingQuery.getGoUrl(this.props.plannerUrl),'_blank'));
        if (favourite.options) {
            const favOptions = Util.iAssign(query.options, FavouritesData.getFavOptionsPart(favourite.options));
            OptionsData.instance.save(favOptions);
            query.options = favOptions;
        }
    }

    private onShowOptions() {
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.getRegionP(new LatLng())
            .then(() => this.setState({showOptions: true}));
    }

    private onOptionsChange(update: Options) {
        OptionsData.instance.save(update);
        this.setState(prevState =>
            this.setState({ routingQuery: Util.iAssign(prevState.routingQuery, {options: update})}));
    }


    public componentDidMount(): void {
        RegionsData.instance.getRegionP(new LatLng()).then((region: Region) => {
            this.setState({ queryInputBounds: region.bounds });
        });
    }

    private onModalRequestedClose() {
        this.setState({showOptions: false});
    }

    public render() {
        const favourite = (this.state.routingQuery.from !== null && this.state.routingQuery.to !== null) ?
            FavouriteTrip.create(this.state.routingQuery.from, this.state.routingQuery.to) :
            null;
        const optionsBtn =
            <button className="QueryWidget-optionsBtn" onClick={this.onShowOptions}>
                Options
            </button>;
        const optionsDialog = this.state.showOptions ?
            <Modal
                isOpen={this.state.showOptions}
                ariaHideApp={false}
                onRequestClose={this.onModalRequestedClose}
            >
                <OptionsView value={this.state.routingQuery.options}
                             region={RegionsData.instance.getRegion(new LatLng())!}
                             onChange={this.onOptionsChange}
                             onClose={this.onModalRequestedClose}
                             className="app-style"
                />
            </Modal>
            : null;
        return (
            <div className="App gl-flex gl-grow">
                <Tabs
                    forceRenderTabPanel={true}
                >
                    <TabList className="App-tabsPanel gl-flex gl-no-shrink">
                        <Tab className={"App-tabBtn gl-grow"}>
                            <IconNpMap className="App-starIcon" aria-hidden={true} focusable="false"/>
                            Journey Planner
                        </Tab>
                        <Tab className={"App-tabBtn gl-grow"}>
                            <IconStarFilled className="App-starIcon" aria-hidden={true} focusable="false"/>
                            My favourite journeys
                        </Tab>
                    </TabList>
                    <TabPanel>
                        <QueryInput
                            value={this.state.routingQuery}
                            bounds={this.state.queryInputBounds}
                            focusLatLng={this.state.queryInputFocusLatLng}
                            onChange={(value: RoutingQuery) => this.setState({routingQuery: value})}
                            onGoClicked={() => this.onGoClicked()}
                            bottomRightComponent={<FavouriteBtn favourite={favourite}/>}
                            bottomLeftComponent={optionsBtn}
                        />
                        {/*<div className="App-school-info">School Services – To display services for your school, select Options then choose your school.</div>*/}
                        <FavouriteList recent={true}
                                       previewMax={1}
                                       showMax={3}
                                       title={"MY RECENT JOURNEYS"}
                                       onValueClicked={this.onFavClicked}
                                       hideWhenEmpty={true}
                                       className="App-lastJourneyPanel gl-scrollable-y"
                                       moreBtnClass="App-favMoreBtn"
                        />
                        <TPlannerDisclaimer className="App-disclaimer gl-no-shrink"/>
                    </TabPanel>
                    <TabPanel>
                        <FavouriteList recent={false}
                                       previewMax={3}
                                       onValueClicked={this.onFavClicked}
                                       className="App-favouriteList gl-flex gl-grow gl-scrollable-y"
                                       moreBtnClass="App-favMoreBtn"
                        />
                    </TabPanel>
                </Tabs>
                {optionsDialog}
            </div>
        );
    }
}

export default QueryWidget;
