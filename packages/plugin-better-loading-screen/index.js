const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

module.exports = () => ({
  // Enable the loading screen
  preExport: (project) => project.getLoadingScreen().showGDevelopSplash(true),
  postExport: (exportPath) => {
    // Replace the loading screen files with the ones from https://github.com/Bouh/GDevelop_stuff/tree/master/splashscreen_custom
    writeFileSync(
      join(exportPath, "gd-splash-image.js"),
      readFileSync(join(__dirname, "gd-splash-image.js"))
    );
    writeFileSync(
      join(exportPath, "pixi-renderers", "loadingscreen-pixi-renderer.js"),
      readFileSync(join(__dirname, "loadingscreen-pixi-renderer.js"))
    );
  },
});
