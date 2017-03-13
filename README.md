# libc

`libc` is a javascript framework which allows to create fast and robust applications.
It has been highly inspired by [Redux](http://redux.js.org/) and [Elm](http://elm-lang.org)
architectures and [Mithrill](http://mithril.js.org) library.

## Build

Prior to building a library, you'll need to install development tools: `npm install`.

To build libc with ES6 syntax use `npm run-script build`. To build one with ES5 syntax use `npm run-script build-es5`.

## Test

Tests reside in `test/` directory. There are both unit tests _(for utility functions and Store)_ and integration tests _(for application)_.

To run tests use `npm run-script test`.

## Use

First, include `libc.js` (or `libc.min.js`) file in your page:

```html
<script src="libc.js"></script>
```

Then, define three entities:

1. *Initial component state*, which is nothing but an object, containing component state
2. *Reducer* or, in terms of Elm, `udpate :: State -> Message -> State` function, returning a new state, calculated on the current state and the incoming message (both passed as function parameters)
3. *View* function, which is `view :: State -> Children -> DispatchFn -> VirtualDOMNode` in terms of Elm; this function should return an array in form of `[(tagName | ComponentFn), {attributes}, ([children] | text)]` to generate the new version of an component UI; this new version will be used to **update** the existing UI (like with React - by using a very small changeset); the second argument for this function is a `dispatch(message)` function, which you may want to use to set event listeners to add some interaction to your component

Now, using the `createComponent :: State -> ViewFn -> UpdateFn -> Component` helper you may create a component.

`Component` is a class, which can be used either in other components, to use with state management API (see the `Store` class) or as a standalone component (`Application`, for example). Its methods are:

1. `init(state, children)` - initializes component with the initial state and children values; this could be handy to, for example, create a high level components (see the `tabs.html` example)
2. `render()` - method, which returns the latest version of component's `VirtualDOMNode` instance

`VirtualDOMNode`, is just as a usual DOM node, except it is handled by JavaScript prior to the browser. It has a set of methods, similar to `DOMNode`:

1. `mount(HTMLElement)`, which mounts the application (attaches application view' DOM tree to the `placeholder` node)
2. `addEventListener(eventName, eventHandler)`
3. `removeEventListener(eventName, eventHandler)`
4. `dispatchEvent(eventObject)`
5. `appendChild(VirtualDOMNode)`
6. `removeChild(VirtualDOMNode)`
7. `getAttribute(attrName)`
8. `setAttribute(attrName, attrValue)`
9. `equal(VirtualDOMNode)` - compares this node to the given one
10. `applyChanges(VirtualDOMNode)` - finds the differences between this VirtualDOMNode and the given one and applies them on this node

## Examples

All the examples could be found in the [`examples/`](https://github.com/shybovycha/libc.js/tree/master/examples) directory.
