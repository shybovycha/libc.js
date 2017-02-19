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

1. *Initial application state*, which is nothing but an object, containing application state
2. *Reducer* or, in terms of Elm, `udpate :: State -> Message -> State` function, returning a new state, calculated on the current state and the incoming message (both passed as function parameters)
3. *View* function, which is `view :: State -> DispatchFn -> Html` in terms of Elm; this function should return an array in form of `[tagName, {attributes}, ([children] | text)]` to generate the new version of an application UI; this new version will be used to **update** the existing UI (like with React - by using a very small changeset); the second argument for this function is a `dispatch(message)` function, which you may want to use to set event listeners to add some interaction to your app

Now, using the `createApplication :: State -> UpdateFn -> ViewFn -> Application` helper you may create an app instance.

Application instance has two handy methods:

1. `mount(HTMLElement)`, which materializes the application (attaches application view' DOM tree to the `placeholder` node)
2. `dispatch(message)`, which sends a message to the `update(...)` function, so you could communicate with your app

Feel free to use the `Application.dispatch` method to set event listeners on the existing UI elements.

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

function view(state, dispatch) {
  return ['div', [
    ['button', { click: () => dispatch('INCREMENT') }, 'Increment'],
    ['button', { click: () => dispatch('DECREMENT') }, 'Decrement'],
    ['div', `Count: ${ state }`]
  ]];
};

createApplication(initialState, update, view).mount(document.body);
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

let view = (state, dispatch) => {
  return ['div', [
    ['div', [
      ['input', { id: 'name', type: 'text' }],
      ['button', { click: () => dispatch({ type: 'WELCOME', name: document.querySelector('#name').value }) }, 'welcome']
    ],
    ['div', { style: `visibility: ${ state.name.length ? 'visible' : 'hidden' };` }, `Hello, ${ state.name }!`]]
  ]];
};

let app = createApplication(initialState, update, view);

app.mount(document.body);
```
