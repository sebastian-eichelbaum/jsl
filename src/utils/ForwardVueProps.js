import _ from "lodash";

/**
 * Generates a forward prop dummy.
 *
 * NOTE: Forwarding props in Vue works automatically. Use this for forwarding props of nested objects and extend them
 * with partially defined defaults.
 *
 * Usage:
 *
 * In A.vue
 * const props = defineProps({
 *     // Define a prop "background" in A.
 *     ...fwdProps("background"),
 *
 *     // ... more
 * });
 *
 * In A.vue <template>
 * // assuming that BackgroundComponent is the final consuming component, use v-bind to destructure the object into the
 * // properties to pass to the final component.
 * <BackgroundComponent v-bind="fwdBindProps("background", $props, {alpha:0.5}) />
 * // If BackgroundComponent also just forwards with the same name and you do not want to add defaults:
 * // ... done automatically bye VUE:
 * <BackgroundComponent v-bind="{ ...$props, ...$attrs }"/>
 * // If BackgroundComponent consumes the prop with a different name or you want to add a default override:
 * <BackgroundComponent :backgroundOptions="fwdBindProps("background", $props, {alpha:0.33}) />
 *
 * In B.vue that uses A
 * <A :background="{alpha: '0', image: myImage}" />
 *
 * @param {String} name The name of the property exported by the component using this
 *
 * @return {Object} an unrollable list of properties and meta props that are used to store defaults
 */
export function fwdProps(name) {
    if (!(typeof name === "string" || name instanceof String)) {
        throw new Error("Property-name must be a string. Got: " + typeof name);
    }

    // Generate the property exported to the outside world. This helps vue to know that "name" is an accepted prop -
    // this avoids those "unused prop" warnings.
    let result = {};
    result[name] = {
        type: Object,
        required: false,
        default: {},
    };

    return result;
}

/**
 * This takes a previously forwarded prop (@see fwdProp) and extends with custom default if they are not yet set.
 *
 * @param {String} name - Name of the property. Must be the same as the fwdProp name
 * @param {Object} props - The VUE properties object (the one you defined via defineProps).
 * @param {Object} [defaultValue] - The defaults to merge in. IF this is a function it has to return the defaults. Very
 *  handy to make defaults dependent on other props.
 *  (allProps, fwdProps) =>{ return {myDefaults:false}; }
 * @throws {Error} - If the defaults are not an object
 * @returns {Object} The object that contains a member per property as named in the original forwarded prop.
 */
export function fwdBindProps(name, props, defaultValue = {}) {
    if (typeof defaultValue === "function") {
        return _.merge(defaultValue(props, props[name]), props[name]);
    }

    if (typeof defaultValue !== "object") {
        throw new Error("Property-default must be an object or function. Got: " + typeof defaultValue);
    }

    return _.merge(defaultValue, props[name]);
}
