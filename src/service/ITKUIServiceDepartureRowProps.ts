import ServiceDeparture from "../model/service/ServiceDeparture";
import {ITKUIServiceDepartureRowStyle} from "./TKUIServiceDepartureRow";
import {TKUIWithStyle} from "../jss/StyleHelper";

interface ITKUIServiceDepartureRowProps extends TKUIWithStyle<ITKUIServiceDepartureRowStyle, ITKUIServiceDepartureRowProps> {
    value: ServiceDeparture;
    onClick?: () => void;
    renderRight?: () => JSX.Element;
}

export default ITKUIServiceDepartureRowProps;