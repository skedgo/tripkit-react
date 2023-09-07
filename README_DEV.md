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

### CI / CD

#### Skip CI pipeline for push

```
git push -o ci.skip
```

### As NPM package

- Commented `type: module` on package.json (ES modules) since it caused some issues on tripkit-react dependencies. So I needed to rename `copyFiles.js` to `.mjs`. I need `type: module` to enable tripkit-react to be used by routing specs when running with Nodejs (server / cli tool).

- Switched from `import DatePicker from 'react-datepicker'` to `import DatePicker from 'react-datepicker/dist/es'` to solve issue with 'react-datepicker' dependency when declaring tripkit-react as `type: module`. Still other issues that made me revert that change (see item above).

### Steps to publish a new version
#### Bump up version + create git commit and tag

- `npm version` to bump up version. It also creates a tag than can then be pushed using `git push gh vX.Y.Z`.
- `npm version prerelease` to bump up pre-release version. E.g. from `1.0.0-rc.0` to `1.0.0-rc.1`.
- `npm version prerelease --preid=alpha` to bump up minor + pre-release version.
- `npm version premajor --preid=alpha` to bump up major + pre-release version. E.g.: if you are in 0.3.0 this will take you to 1.0.0-alpha.0
- `npm version premajor --preid=alpha -m "Upgrade to %s for reasons"` to include version commit message.

More info:
- If run in a git repo, it will also create a version commit and tag. [npm-version](https://docs.npmjs.com/cli/v6/commands/npm-version)
- If supplied with -m or --message config option, npm will use it as a commit message when creating a version commit. If the message config contains %s then that will be replaced with the resulting version number. For example:
```npm version patch -m "Upgrade to %s for reasons"```
- For automation: if preversion, version, or postversion are in the scripts property of the package.json, they will be executed as part of running npm version. E.g.
```json
"scripts": {
      "preversion": "npm test",
      "version": "npm run build && git add -A dist",
      "postversion": "git push && git push --tags && rm -rf build/temp"
}
```

#### Push to github
- `git push && git push --tags`

#### Publish to npm

From [npm-publish](https://docs.npmjs.com/cli/v6/commands/npm-publish)

npm publish [<tarball>|<folder>] [--tag <tag>] [--access <public|restricted>] [--otp otpcode] [--dry-run]

Publishes '.' if no argument supplied
Sets tag 'latest' if no --tag specified