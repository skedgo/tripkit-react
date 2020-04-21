import React from "react";
interface IProps {
    apiKey: string;
}
declare class QueryWidget extends React.Component<IProps, {}> {
    constructor(props: IProps);
    private onContinueClicked;
    render(): React.ReactNode;
}
export default QueryWidget;
