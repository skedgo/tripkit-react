### Import as local repo

- Sym link to tripkit-react dir on client package node_modules dir:<br>
```npm link tripkit-react```
- Make tripkit-react to use the same instance of react than tripgo-web, 
to avoid error about invalid use of hooks. On tripkit-react dir run:<br> 
```npm link ../<client_package_dir>/node_modules/react``` 

#### Hot loading of lib updates

Make tripkit-react dependency point to src folder of local repo. 
Just for dev run with hot load of lib, the following changes should be
undone when want to use prod compiled version of the lib 
(either in dev or prod mode).

On client package:

```config-overrides.js```

```
module.exports = override(
   babelInclude([
       path.resolve('src'),
       path.resolve('../tripkit-react/src')
   ])
);
```

```tsconfig.json```
```
"include": [
 "src",
 "node_modules/tripkit-react/src"
]
```
Observation: not sure why this is actually necessary, try to understand this better.
If not included then it seems that an update on the library types doesn't reflect 
on client project, even on browser reload. But when included it seems that type 
checks are not performed, so that's why type check doesn't fail, intead of re-freshing
types.

On tripkit-react

```package.json:```

```
"main": "src/index.tsx",
```
and remove ```"types"```


#### Script for hot loading of lib updates

The idea is to have a script ```start:hot-tripkit```
on client package that applies the typescript and babel overrides that we have
currently to do manually.

Define ```config-overrides.js``` as:

```
module.exports = override(
    // add tripkit src folder to babel include if running in hot tripkit mode.
    process.env.REACT_APP_HOT_TRIPKIT == 1 &&
    babelInclude([
        path.resolve('src'),
        path.resolve('../tripkit-react/src')
    ])
);

```

and add the following script to ```package.json```:

```
"start:hot-tripkit": "REACT_APP_HOT_TRIPKIT=1 react-app-rewired start",
```

This is not working yet, the tsconfig.json override is still pending.

Tried with ```react-app-rewire-alias``` without success:

```
const { override, babelInclude } = require('customize-cra');
const {alias} = require('react-app-rewire-alias');

const path = require('path');
const aliasMap = {
    'tripkit-react': './node_modules/tripkit-react/src'
};

// For _dev (not _prod) mode, tripkit-react as local un-compiled lib
// noinspection EqualityComparisonWithCoercionJS
module.exports = override(
    // add tripkit src folder to babel include if running in hot tripkit mode.
    process.env.REACT_APP_HOT_TRIPKIT == 1 &&
    babelInclude([
        path.resolve('src'),
        path.resolve('../tripkit-react/src')
    ]),
    process.env.REACT_APP_HOT_TRIPKIT == 1 && alias(aliasMap)
);
```