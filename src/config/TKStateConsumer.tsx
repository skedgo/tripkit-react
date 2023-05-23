import React from "react";
import { TKState } from "./TKState";
import { useTKState } from "./TKStateProvider";

interface IProps {
    children: (state: TKState) => React.ReactNode;
}

const TKStateConsumer: React.FunctionComponent<IProps> = ({ children }) => {
    const tKState = useTKState();
    return <>{children(tKState)}</>;
}

export default TKStateConsumer;