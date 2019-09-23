import * as React from "react";
import injectSheet from "react-jss";
import { Subtract } from "utility-types";
import { ClassNameMap } from "react-jss";

function withStyleProp<
        // ST extends Record<string, CSSProperties<IProps>>,
        ST extends any,
        // CP extends WithSheet<keyof ST, object, CP>,
        CP extends {classes: ClassNameMap<keyof ST>},
        ExtS extends string,
        // P extends Subtract<CP, WithSheet<keyof ST, object, CP>> & {styles: Styles<ExtS, CP>}>
        // P extends Subtract<CP, {classes: ClassNameMap<keyof ST>}> & {styles: Styles<ExtS, CP>}>
        P extends Subtract<CP, {classes: ClassNameMap<keyof ST>}> & {styles?: any}>
        // (Consumer: React.ComponentType<any>, obj: ST) {
        (Consumer: React.ComponentType<CP>, defaultStyle: any) {

    return class WithStyleProp extends React.Component<P, {}> {

        private StyledComponent: any;

        constructor(props: P) {
            super(props);
            this.StyledComponent =
                this.props.styles ?
                injectSheet(this.props.styles)(Consumer as any) :
                injectSheet(defaultStyle)(Consumer as any);
        }

        public render(): React.ReactNode {
            const {...props} = this.props as P;
            return <this.StyledComponent
                {...props}
            />;
        }
    }
}

export {withStyleProp};