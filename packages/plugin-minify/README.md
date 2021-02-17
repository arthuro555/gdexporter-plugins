> This is an unstable plugin, it may break your game in some edge cases.

# plugin-minify

Bundles all javascript together and minifies it with esbuild.

## Options

```js
{
  useESBuild: true,
  esbuild: {},
  keepOriginalFiles: false,
  keepMerger: false,
  outputFileName: "game.js",
  verbose: false,
  ignoredFiles: [],
  verbose: false,
}
```

#### `useESBuild = true`

If true, the bundled file will be minified by esbuild.

#### `esbuild = {}`

Those options are forwarded to esbuild directly, if it is used.
By default, the minify and bundle options are activated.
Find all options on the esbuild website: https://esbuild.github.io/api/#build-api

#### `keepOriginalFiles = false`

If false, the original files that have been bundled will be deleted. Recommended as those are now redundant.

#### `keepMerger = false`

If false, the unminified version of the ouput file will be deleted after being minified by esbuild.
Ignored when not using esbuild.

#### `outputFileName = "game.js"`

The name of the bundled file.

#### `mergerFileName = "__merger_file__.js"`

The name of the temporary merger file.
Ignored if not using esbuild.

#### `ignoredFiles = []`

A list of files to ignore. Don't use this unless you know what you are doing (example: you made a custom web worker that shouldn't be bundled).

#### `verbose: false`

If true, prints a lot of useless info.
