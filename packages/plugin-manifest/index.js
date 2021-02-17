const { writeFile } = require("fs").promises;
const { join } = require("path");

let manifest;
module.exports = ({
  manifestOptions = {},
  manifestName = "manifest.webmanifest",
}) => ({
  preExport: (project) => {
    // Ind the background color
    const firstLayout = project.getLayoutAt(0);
    const color = [
      firstLayout.getBackgroundColorRed(),
      firstLayout.getBackgroundColorGreen(),
      firstLayout.getBackgroundColorBlue(),
    ].reduce((accumulator, current) => accumulator + current.toString(16), "#");

    // Find icons
    const psa = project.getPlatformSpecificAssets();
    const resourcesManager = project.getResourcesManager();
    const getFileName = (platform, name) =>
      resourcesManager.getResource(psa.get(platform, name)).getFile();

    // Use a map to not have duplicates
    const iconsMap = {};

    // IOS icons
    [
      180,
      60,
      120,
      76,
      152,
      40,
      80,
      57,
      114,
      72,
      144,
      167,
      29,
      58,
      87,
      50,
      20,
      100,
      167,
      1024,
    ].forEach((size) => {
      const fileName = getFileName("ios", "icon-" + size);
      if (fileName.length > 0) iconsMap[size] = fileName;
    });

    // Android icons
    [36, 48, 72, 96, 144, 192].forEach((size) => {
      const fileName = getFileName("android", "icon-" + size);
      if (fileName.length > 0) iconsMap[size] = fileName;
    });

    const desktopIcon = getFileName("desktop", "icon-512");
    if (desktopIcon.length > 0) iconsMap[512] = desktopIcon;

    // Convert the map to a spec compliant array
    const icons = Object.entries(iconsMap).map(([size, src]) => ({
      src,
      sizes: `${size}x${size}`,
    }));

    manifest = Object.assign(
      {
        name: project.getName(),
        short_name: project.getName(),
        start_url: ".",
        display: "standalone",
        background_color: color,
        theme_color: color,
        description: project.getName(),
        orientation: project.getOrientation().replace("default", "any"),
        icons: icons.length === 0 ? undefined : icons,
      },
      manifestOptions
    );
  },
  document: (document) =>
    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "manifest",
        href: manifestName,
      })
    ),
  postExport: async (exportPath) =>
    await writeFile(join(exportPath, manifestName), JSON.stringify(manifest)),
});
