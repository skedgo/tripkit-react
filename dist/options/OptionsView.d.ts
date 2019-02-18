import * as React from "react";
import Options from "../model/Options";
import "./OptionsView.css";
import Region from "../model/region/Region";
import ModeIdentifier from "../model/region/ModeIdentifier";
interface IProps {
    value: Options;
    region: Region;
    onChange?: (value: Options) => void;
    onClose?: () => void;
    className?: string;
}
interface IState {
    update: Options;
    schools?: string[];
    schoolModeId?: ModeIdentifier;
    pickSchoolError: boolean;
}
declare class OptionsView extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private onModeCheckboxChange;
    private onPrefCheckedChange;
    private isChecked;
    private onWheelchairChange;
    private onBikeRacksChange;
    private onMapOptionChange;
    private isModeEnabled;
    private close;
    private checkValid;
    static skipMode(mode: string): boolean;
    static getOptionsModeIds(region: Region): ModeIdentifier[];
    render(): React.ReactNode;
}
export default OptionsView;
