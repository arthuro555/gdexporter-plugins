const { build } = require("esbuild");
const deleteEmpty = require("delete-empty");
const { join } = require("path");
const { writeFile, readFile, unlink } = require("fs").promises;
const { performance } = require("perf_hooks");

let allSources = [];
let initializerCode = "";

module.exports = ({
  useESBuild = true,
  esbuild: esbuildOptions = {},
  keepOriginalFiles = false,
  keepMerger = false,
  outputFileName = "game.js",
  mergerFileName = "__merger_file__.js",
  ignoredFiles = [],
  verbose = false,
}) => ({
  document: (document) => {
    // Replace all scripts with the bundled one
    for (const script of Array.from(
      document.head.getElementsByTagName("script")
    )) {
      const source = String(script.src).replace(/\\/g, "/");
      for (ignoredFile of ignoredFiles) if (ignoredFile === source) continue;
      if (verbose)
        console.info(`[plugin-minify] Detected source file ${source}!`);
      allSources.push(source);
      script.remove();
    }

    const newScript = document.createElement("script");
    newScript.src = outputFileName;
    document.head.appendChild(newScript);

    // Get the intializer code and remove it from index.html
    Array.from(document.body.getElementsByTagName("script"))
      .filter((script) => script.innerHTML.includes(`new gdjs.RuntimeGame`))
      .forEach((script) => {
        initializerCode = script.innerHTML;
        script.remove();
      });
  },
  postExport: async (exportPath) => {
    // Create a merger file that contains all sources, as we cannot bundle multiple source files
    // directly (see https://esbuild.github.io/api/#bundle)
    const finalMergerFileName = join(exportPath, mergerFileName);
    const finalOutputFileName = join(exportPath, outputFileName);
    const begin = performance.now();
    if (verbose)
      console.info(
        `[plugin-minify] Beginning minification\n[plugin-minify] Merger path: ${finalMergerFileName}\n[plugin-minify] Output path: ${finalOutputFileName}`
      );

    const allFiles = [];
    // Load all files in memory
    await Promise.all(
      allSources.map(async (file, index) => {
        allFiles[index] = await readFile(join(exportPath, file));
      })
    );
    // Concatenate all loaded files
    const mergerFile =
      allFiles.reduce(
        (accumulator, value, index) =>
          accumulator + `// ${allSources[index]} \n` + value + "\n",
        ""
      ) +
      "document.addEventListener('DOMContentLoaded', function () {" +
      initializerCode +
      "});";
    if (verbose) console.info("[plugin-minify] Created merger");
    await writeFile(
      useESBuild ? finalMergerFileName : finalOutputFileName,
      mergerFile
    );
    if (verbose) console.info("[plugin-minify] Wrote merger file");

    // Build the merger file with esbuild
    if (useESBuild)
      await build(
        Object.assign(
          {
            entryPoints: [finalMergerFileName],
            bundle: true,
            minify: true,
            outfile: finalOutputFileName,
            external: ["electron"],
          },
          esbuildOptions || {}
        )
      );

    if (verbose)
      console.info(
        `[plugin-minify] Minifying done in ${performance.now() - begin}ms`
      );

    // Now that all sources have been bundled together,
    // remove the originals, the empty directories and the merger file.
    if (!keepOriginalFiles)
      await Promise.all(
        allSources.map((source) => unlink(join(exportPath, source)))
      );
    if (!keepMerger && useESBuild) await unlink(finalMergerFileName);
    await deleteEmpty(exportPath);
  },
});
