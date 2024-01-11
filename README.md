# jsl for VUE/JavaScript

A collection of UI components and backend wrappers. Its focus is on Vue, Vuetify and Firebase as backend. Its purpose is to simplify generating a simple, yet good looking, UI in my projects.

> **Warning**
> This library is not actively maintained. It is updated and extended whenever I use it in a project.
>
> So, do not use it in your projects. As with all things JavaScript, it will be deprecated in three days anyways.

## Requirements

-   A working nodejs project.

## Install

1. Scaffold your base app using some magic tools
1. Install:

    ```sh
    cd myProject
    git submodule add git@github.com:sebastian-eichelbaum/jsl.git ./jsl
    # This installs the lib as local dependency. npm link might also be used.
    npm install ./jsl
    ```

1. Setup the required import alias: `@jsl`, `@jslassets`, `@jsllocales`. This depends on the packager you use.
    - In Vite, extend your `vite.config.json`:
    ```js
    export default defineConfig({
        // ...
        resolve: {
            alias: {
                "@jsl": path.resolve(__dirname, "./jsl/src"),
                "@jslassets": path.resolve(__dirname, "./jsl/assets"),
                "@jsllocales": path.resolve(__dirname, "./jsl/locales"),
                // ...
            },
        },
    });
    ```

## Usage

TODO
