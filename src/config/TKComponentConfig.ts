import { TKUICustomStyles, TKUIStyles, TKUIWithClasses } from "../jss/StyleHelper";
import { Subtract } from "utility-types";

/**
 * Component configuration
 */
const TKComponentConfigForDoc = (props: TKComponentConfig<any, any>) => null;

export interface TKComponentDefaultConfig<P extends TKUIWithClasses<S, P>, S> {
    /**
     * Allows to replace component implementation with a custom one by specifying a function from component's props
     * to a JSX.Element.
     * @ctype (props: object) => JSX.Element
     */
    render: (props: P) => JSX.Element;

    styles: TKUIStyles<S, P>;

    /**
     * Set to false to disable style class names randomization, useful if you want to style components using traditional
     * CSS stylesheet files (.css), instead of JSS.
     * @default true
     */
    randomizeClassNames?: boolean;

    /**
     * Set to true if want classNamePrefix to be applied.
     * This property comes into consideration just when randomizeClassNames is true, since if it's false then
     * classNamePrefix needs to be applied to avoid collisions.
     * @default false
     */
    verboseClassNames?: boolean;

    /**
     * Prefix for component's style class names. Will be applied if randomizeClassNames is false or
     * verboseClassNames is true. Notice that with the default values of the previous properties it won't be applied,
     * which is the most efficient scheme, suitable for production build.
     * @default The component's name.
     */
    classNamePrefix: string;

    /**
     * Allows to override the values of any of the properties of the component. The override value specified for a given
     * property takes precedence over the property value passed to the component wherever it's used in the system.
     * You can also specify a function receiving the original props passed to the component, so your override can be
     * defined in terms of the props you are overriding.
     * @ctype object | ((implProps: object) => object);
     * */
    props?: TKUIPropsOverride<P, S>;
}

export type TKComponentConfig<P extends TKUIWithClasses<S, P>, S> =
    Partial<
        Subtract<
            TKComponentDefaultConfig<P, S>,
            {
                styles: TKUIStyles<S, P>;
                render: (props: P) => JSX.Element;
            }
        > & {
            /**
             * Allows to specify a _styles override object_, or a function of [theme](TKUITheme) returning a styles
             * override object. See a detailed explanation and example [here](#/Component-level%20Customization/Styles).
             * @ctype object | (theme: TKUITheme) => object
             */
            styles: TKUICustomStyles<S, P>;
            render: (props: P, defaultRender: (props: P) => JSX.Element) => JSX.Element;
        }>;

export type TKUIPropsOverride<P extends TKUIWithClasses<S, P>, S> = Partial<P> | ((implProps: P) => Partial<P>);

export default TKComponentConfigForDoc;