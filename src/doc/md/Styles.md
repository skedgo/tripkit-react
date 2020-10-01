SDK components styles are defined using [JSS](https://cssinjs.org/?v=v10.4.0), a CSS-in-JS solution which allows you to 
use JavaScript to describe CSS styles in a declarative, conflict-free and reusable way.
Each component has a default JSS stylesheet, which can be __partially__ or __completely overridden__ through the 
```styles``` config property. See the following example overriding styles for routing results component 
(TKUIRoutingResultsView):

```js static
const config = {
  ...  
  TKUIRoutingResultsView: {
    styles: (theme: TKUITheme) => ({
      main: (defaultStyle) => ({
            ...defaultStyle,
            background: '#f4f7fe'
      }),
      row: {
            margin: '15px',
            '&:hover': {
                backgroundColor: 'lightgray'
            }
        }
     })
  }
  ...
}
```

__Some highlights__:

- The ```styles``` property should specify a _styles override object_, or a function of [theme](TKUITheme) returning a styles
override object, as in the example.
-  A _styles override object_ specifies a map from css class names you want to override to _JSS props objects_ 
(objects with JSS property-value pairs).
You can also specify a function receiving the default JSS props object and returning the override,
which is useful if you just want to override some of the css props of the class while preserving the rest, as shown for 
'main' in the example. You can find the basic syntax for _JSS props objects_ [here](https://cssinjs.org/jss-syntax/?v=v10.4.0),
considering we also use these JSS syntax extension plugins: 
[jss-plugin-camel-case](https://cssinjs.org/jss-plugin-camel-case?v=v10.4.0) (allowing to write CSS properties in camel 
case syntax), [jss-plugin-nested](https://cssinjs.org/jss-plugin-nested/?v=v10.4.0) (allowing to use pseudo and nested 
selectors) and [jss-plugin-global](https://cssinjs.org/jss-plugin-global/?v=v10.4.0) (allowing to specify global selectors).  
- You can find the list of style classes of a component on the CSS section of the component API spec (e.g. see 
[](TKUIResultsView)). In our example we override just 'main' and 'row' classes of TKUIResultsView.


There are also other three style related config properties controlling the css class names that are actually generated 
and used in run-time: randomizeClassNames, verboseClassNames and classNamePrefix. 
See [TKComponentConfig reference](TKComponentConfig) for more information. 

[//]: # "- randomizeClassNames: allows to specify if class names should be randomized, and it's true by default. 
Randomizing class names is in general a good practice (to prevent class name clashes), but you may want to disable it 
if you want to style an SDK component using an external (traditional) css stylesheets.
- classNamePrefix: allows to specify a custom prefix for component style classnames."

[//]: # "[ ] Allow a way to reset styles, e.g. by passing a reset stylesheet to the component (one overriding all classes with empty objects), or provide an additional attribute to specify that."

### Pass styles directly to component

Alternatively to specify a styles override for a component through SDK config you can pass it directly to the component
using styles property.

```jsx static
const stylesOverride = {
    styles: (theme: TKUITheme) => ({
        main: (defaultStyle) => ({
            ...defaultStyle,
                background: '#f4f7fe'
        }),
        row: {
            margin: '15px',
            '&:hover': {
                backgroundColor: 'lightgray'
            }
        }
    })
};

...
<TKUIRoutingResultsView styles={stylesOverride}/>
...

```

Passing the styles override through component property is just possible if you use that component directly, while you 
need the global root level scheme if not, that is, if you use a higher level component (e.g. TKUITripPlanner) that in
turn uses, at some point below in the components hierarchy, the component whose styles you want to override.