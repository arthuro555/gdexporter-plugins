# plugin-offline

Generates a service worker for caching using workbox, to allow playing the game offline.

## Options

```js
{
  workerFileName: "sw.js",
  sourceWorker: "./myWorker.js",
  workboxOptions: {
    runtimeCache: [
      {
        urlPattern: "*",
        handler: "NetworkFirst",
      },
    ],
  },
}
```

#### `workerFileName = "sw.js"`

The filename of the output service worker.

#### `sourceWorker = undefined`

If a string is passed as sourceWorker, the plugin will use injectManifest instead of generateSW.
You can find the differences [on the official workbox docs](https://developers.google.com/web/tools/workbox/modules/workbox-build#which_mode_to_use).

#### `workboxOptions = {runtimeCaching: [{ urlPattern: "*", handler: "NetworkFirst" }], globPatterns: ["**/*"]}`

The options passed to workbox when building. You can find them [on the official workbox docs](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW).
Be aware that the available options may vary depending on if you use injectManifest or generateSW (see the `sourceWorker` option).
