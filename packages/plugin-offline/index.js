const { generateSW, injectManifest } = require("workbox-build");
const { join } = require("path");

module.exports = ({
  workerFileName = "sw.js",
  sourceWorker,
  workboxOptions = {},
}) => {
  const workerLoaderScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('${workerFileName}');
  });
}
`;

  return {
    document: (document) =>
      document.head.appendChild(
        Object.assign(document.createElement("script"), {
          innerHTML: workerLoaderScript,
        })
      ),
    postExport: (exportPath) => {
      const inject = typeof sourceWorker === "string";
      /** @type {import("workbox-build").GenerateSWConfig | import("workbox-build").InjectManifestConfig} */
      const baseWorkboxOptions = {
        swDest: join(exportPath, workerFileName),
        ...(inject
          ? {}
          : {
              runtimeCaching: [
                {
                  urlPattern: "*",
                  handler: "NetworkFirst",
                },
              ],
            }),
        globDirectory: exportPath,
        globPatterns: ["**/*"],
      };

      if (inject)
        return injectManifest(
          Object.assign(
            baseWorkboxOptions,
            {
              swSrc: sourceWorker,
            },
            workboxOptions
          )
        );
      else return generateSW(Object.assign(baseWorkboxOptions, workboxOptions));
    },
  };
};
