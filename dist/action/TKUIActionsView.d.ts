import * as React from "react";
interface IProps {
    actions: (JSX.Element | undefined)[];
    className?: string;
}
declare class TKUIActionsView extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TKUIActionsView;
