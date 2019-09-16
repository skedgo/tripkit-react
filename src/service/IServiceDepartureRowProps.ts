import ServiceDeparture from "../model/service/ServiceDeparture";

interface IServiceDepartureRowProps {
    value: ServiceDeparture;
    onClick?: () => void;
    renderRight?: () => JSX.Element;
}

export default IServiceDepartureRowProps;