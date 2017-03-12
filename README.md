# libc

`libc` is a javascript framework which allows to create fast and robust applications.
It has been highly inspired by [http://redux.js.org/](Redux) and [http://elm-lang.org](Elm)
architectures and [http://mithril.js.org](Mithrill) library.

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

Note: more examples could be found in the `examples/` directory.

### Counter

```js
var initialState = 0;

function update(state, message) {
  if (message == 'INCREMENT')
    return state + 1;

  if (message == 'DECREMENT')
    return state - 1;

  return state;
};

function view(state, children, dispatch) {
  return ['div', [
    ['button', { click: () => dispatch('INCREMENT') }, 'Increment'],
    ['button', { click: () => dispatch('DECREMENT') }, 'Decrement'],
    ['div', `Count: ${ state }`]
  ]];
};

createComponent(view, update).init(initialState).mount(document.body);
```

### Welcome app

```js
let initialState = {
  name: ''
};

let update = (state, message) => {
  if (message.type == 'WELCOME')
    return Object.assign({}, state, { name: message.name });

  return state;
};

let view = (state, children, dispatch) => {
  return ['div', [
    ['div', [
      ['input', { id: 'name', type: 'text' }],
      ['button', { click: () => dispatch({ type: 'WELCOME', name: document.querySelector('#name').value }) }, 'welcome']
    ],
    ['div', { style: `visibility: ${ state.name.length ? 'visible' : 'hidden' };` }, `Hello, ${ state.name }!`]]
  ]];
};

let app = createApplication(view, update).init(initialState);

app.mount(document.body);
```

### Tabs widget

```js
let Tabs = (function () {
    let update = (state, message) => {
        if (message.type == 'SELECT_TAB')
            return Object.assign({}, state, {
                currentTabIndex: message.tabIndex
            });

        return state;
    };

    let view = (state, children, dispatch) => {
        let currentTabIndex = state.currentTabIndex || 0;

        let tabHeaders = children.map((tab, tabIndex) => {
            return [ 'div', {
                    class: `tab-header ${tabIndex == currentTabIndex ? 'selected' : ''}`,
                    click: () => dispatch({
                        type: 'SELECT_TAB',
                        tabIndex
                    })
                },
                [ tab.children[0] ]
            ];
        });

        let tabs = children.map((tab, tabIndex) => {
            return [ 'div',
                { class: `tab-content ${tabIndex == currentTabIndex ? 'selected' : ''}` },
                tab.children.slice(1)
            ];
        });

        return [ 'div', [
            [ 'div', { class: 'tab-headers' }, tabHeaders ],
            [ 'div', { class: 'tab-container' }, tabs ]
        ]];
    };

    return createComponent(view, update);
})();

let app = (function () {
    let view = (state, children, dispatch) => {
        return [ Tabs, [
            ['div', [
                ['div', { class: 'header' }, 'Tab #1'],
                ['div', 'FIRST TAB CONTENT']
            ]],
            ['div', [
                ['div', { class: 'header' }, 'Tab #2'],
                ['div', 'SECOND TAB CONTENT']
            ]],
            ['div', [
                ['div', { class: 'header' }, 'Tab #3'],
                ['div', 'THIRD TAB CONTENT']
            ]],
        ] ];
    };

    return createComponent(view);
})();

app.init().mount(document.querySelector('#app'));
```
