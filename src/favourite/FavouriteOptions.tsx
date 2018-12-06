import * as React from "react";
import OptionsView from "../options/OptionsView";
import RegionsData from "../data/RegionsData";
import FavouriteTrip from "../model/FavouriteTrip";
import Region from "../model/region/Region";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
import "./FavouriteOptions.css";
import Constants from "../util/Constants";
import GeocodingSource from "../location_box/GeocodingSource";

interface IProps {
    favourite: FavouriteTrip;
}

interface IState {
    region?: Region;
}

class FavouriteOptions extends React.Component<IProps, IState> {


    constructor(props: Readonly<IProps>) {
        super(props);
        this.state = {};
    }

    public render(): React.ReactNode {
        const options = this.props.favourite.options!;
        return this.state.region ?
            <div className="FavouriteOptions" aria-hidden={true}>
                { OptionsView.getOptionsModeIds(this.state.region)
                    .filter((mode: ModeIdentifier) =>
                        options.isModeEnabled(mode.identifier) ||
                        (mode.identifier === ModeIdentifier.SCHOOLBUS_ID &&
                            (this.props.favourite.from.source === GeocodingSource.ACT_SCHOOLS || this.props.favourite.to.source === GeocodingSource.ACT_SCHOOLS)))
                    .map((modeId: ModeIdentifier, index: number) => {
                        const circleBg = modeId.icon === null;
                        const circleBorder = !circleBg;
                        const onDark = !modeId.identifier.includes(ModeIdentifier.SCHOOLBUS_ID); // TODO: Hardcoded for TC
                        const transportColor = TransportUtil.getTransportColorByIconS(TransportUtil.modeIdToIconS(modeId.identifier));
                        // const circleBg = false;
                        // const circleBorder = false;
                        // const onDark = false; // TODO: Hardcoded for TC
                        return <img src={TransportUtil.getTransportIconModeId(modeId, false, onDark)}
                                    className={"FavouriteOptions-icon " + (circleBg ? " FavouriteOptions-onDark" : "")}
                                    style={{
                                        backgroundColor: circleBg ? (transportColor !== null ? transportColor : "black") : "none",
                                        border: circleBorder ? "1px solid " + (transportColor !== null ? transportColor : "black") : "none",
                                    }}
                                    key={index}
                        />
                    }) }
                { options.wheelchair ?
                    <img src={Constants.absUrl("/images/modeicons/ic-wheelchair.svg")}
                         className="FavouriteOptions-icon FavouriteOptions-onDark gl-charSpace"
                         style={{
                             border: "1px solid grey"
                         }}
                    /> : null }
                { options.bikeRacks ?
                    <img src={Constants.absUrl("/images/modeicons/ic-bikeRack.svg")}
                         className="gl-charSpace FavouriteOptions-iconSize"/> : null }
            </div> : null;
    }


    public componentDidMount(): void {
        RegionsData.instance.getRegionP(this.props.favourite.from)
            .then((region: Region) => {
                this.setState({ region: region });
            });
    }
}

export default FavouriteOptions;