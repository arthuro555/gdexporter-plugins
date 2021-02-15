const { build } = require("esbuild");
const deleteEmpty = require("delete-empty");
const { join } = require("path");
const { writeFile, unlink } = require("fs").promises;

let allSources = [];
module.exports = (options) => ({
  document: (document) => {
    // Replace all scripts with the bundled one
    for (const script of Array.from(
      document.head.getElementsByTagName("script")
    )) {
      allSources.push(String(script.src).replace(/\\/g, "/"));
      script.remove();
    }

    const newScript = document.createElement("script");
    newScript.src = "game.js";
    document.head.appendChild(newScript);
  },
  postExport: async (exportPath) => {
    // Create a merger file that imports all sources, as we cannot bundle multiple source files
    // directly (see https://esbuild.github.io/api/#bundle)
    const mergerFileName = join(exportPath, "__merger_file__.js");
    const mergerFile =
      allSources.reduce(
        (accumulator, current) => (accumulator += `import "./${current}";\n`),
        ""
      ) +
      `
    //Initialization
    var game = new gdjs.RuntimeGame(gdjs.projectData, {});

    //Create a renderer
    game.getRenderer().createStandardCanvas(document.body);

    //Bind keyboards/mouse/touch events
    game.getRenderer().bindStandardEvents(game.getInputManager(), window, document);

    //Load all assets and start the game
    game.loadAllAssets(function() {
        game.startGameLoop();
    });`;
    await writeFile(mergerFileName, mergerFile);

    // Build with esbuild
    await build(
      Object.assign(
        {
          entryPoints: [mergerFileName],
          bundle: true,
          minify: true,
          outfile: join(exportPath, "game.js"),
          external: ["electron"],
        },
        options || {}
      )
    );

    // Now that all sources have been bundled together,
    // remove the originals, the empty directories and the merger file.
    /*
    await Promise.all(
      allSources
        .map((source) => unlink(join(exportPath, source)))
        .concat([unlink(mergerFileName)])
    );*/
    await deleteEmpty(exportPath);
  },
});
