const _ = require("lodash");

module.exports = {
    /**
     * Generate an electron forge config and extend the defaults with the given overrides.
     *
     * @param {object} packageJson The top-level package json - used to generate some defaults like the productName.
     * @param {string} appIDRoot The application ID root name. Something like com.nemtics.MyApp
     * @param {string} variant The identifier for the build variant. Use this to distinguish differently built
     * versions.
     * @param {object} config Overrides the default config. Is a forge config.
     */
    makeElectronForgeConfig: (packageJson, appIDRoot, variant, config = {}) => {
        const productName =
            // Product name by package json
            packageJson?.productName || packageJson?.name || "UnnamedProduct";

        const appID =
            (appIDRoot || "com.nemtics.UnnamedProduct") + (variant == null || variant == "" ? "" : "." + variant);
        const productNameVariant = productName + (variant == null || variant == "" ? "" : "-" + variant);

        return _.merge(
            {
                buildIdentifier: appID,
                packagerConfig: {
                    appBundleId: appID,
                    // Do not pack this?
                    ignore: [
                        // Usually, only the modules, vite output and external libs are needed.
                        "^/(?!jsl|exlauncher|.vite|node_modules|package.json).*$",

                        // OR, specify what to exclude

                        // Remove the dotfiles EXCEPT .vite (the build dir where vite puts its output)
                        //"^/[.](?!vite).*$",

                        // Assets and source referenced in code are collected by vite. Exclude the originals.
                        //"^\\/assets$",
                        //"^\\/public$",
                        //"^\\/src$",
                    ],

                    // Use ASAR to have everything in an archive
                    asar: true,

                    // Not all locales needed
                    electronLanguages: ["en-US", "de"],

                    // Icons
                    icon: "assets/icons/icon", // ext is added automatically

                    // The name of the build. This also defines the name of the EXE
                    name: productNameVariant,
                },
                rebuildConfig: {},
                makers: [
                    //{
                    //    name: "@electron-forge/maker-zip",
                    //    platforms: ["win32"],
                    //},
                    {
                        name: "@electron-forge/maker-squirrel",
                        config: {
                            name: productNameVariant, // Name in AppData/Local/ as install location
                            //exe: productName + ".exe", // Defaults to packagerConfig.name
                            setupExe: productNameVariant + "-Setup.exe",

                            setupIcon: "assets/icons/icon.ico",
                            // The splash. Scaling is strange. Using gif uses the correct size.
                            loadingGif: "assets/Splash.gif",
                        },
                    },
                ],
                plugins: [
                    {
                        name: "@electron-forge/plugin-vite",
                        config: {
                            // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
                            // If you are familiar with Vite configuration, it will look really familiar.
                            build: [
                                {
                                    // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
                                    entry: "src/main.js",
                                    config: "vite.main.config.mjs",
                                },
                                {
                                    entry: "src/preload.js",
                                    config: "vite.preload.config.mjs",
                                },
                            ],
                            renderer: [
                                {
                                    name: "main_window",
                                    config: "vite.renderer.config.mjs",
                                },
                            ],
                        },
                    },
                ],
            },

            config || {},
        );
    },
};
