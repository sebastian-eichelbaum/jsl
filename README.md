# jsl for VUE/JavaScript

A collection of UI components and backend wrappers. Its focus is on Vue, Vuetify and Firebase as backend. Its purpose is to simplify generating a simple, yet good looking, UI in my projects.

> **Warning**
> This library is not actively maintained. It is updated and extended whenever I use it in a project.
>
> So, do not use it in your projects. As with all things JavaScript, it will be deprecated in three days anyways.

**Note:** this is not a NPM package. It is intended to be used as git subrepo.

## Requirements

1. Scaffold your base app using some magic tools
1.

```sh
git submodule add git@github.com:
npm install ./jsl
```

1. Setup import alias: `@jsl`, `@jslassets`, `@jsllocales`
    - In Vite extend your config to have these alias:
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
