# libc.js

libc.js is a javascript framework which allows to create fast and robust applications.
It has been highly inspired by Redux and Elm architectures and mithrill.js library.

## Use

First, include `c.js` file in your page:

    <script src="c.js"></script>

Then, define three entities:

1. *Initial application state*, which is nothing but an object, containing application state
2. *Reducer* or, in terms of Elm, `udpate :: State -> Message -> State` function, returning a new state, calculated on the current state and the incoming message (both passed as function parameters)
3. *View* function, which is `view :: State -> DispatchFn -> Html` in terms of Elm; this function may use `c(tagName, [attributes], [children | text])` helper to generate the new version of an application UI; this new version will be used to **update** the existing UI (like with React - by using a very small changeset); the second argument for this function is a `dispatch(message)` function, which you may want to use to set event listeners to add some interaction to your app

Now, using the `createApplication :: State -> UpdateFn -> ViewFn -> Application` helper you may create an app instance.

Application instance has two handy methods:

1. `mount(HTMLElement)`, which materializes the application (attaches application view' DOM tree to the `placeholder` node)
2. `dispatch(message)`, which sends a message to the `update(...)` function, so you could communicate with your app

Feel free to use the `Application.dispatch` method to set event listeners on the existing UI elements.

## Example

```
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>libc.js example</title>
    <script src="c.js"></script>
  </head>
  <body>
    <div id="app"></div>

    <script>
      let initialState = {
        name: ''
      };

      let update = (state, message) => {
        if (message.type == 'WELCOME')
          return Object.assign({}, state, { name: message.name });

        return state;
      };

      let view = (state, dispatch) => {
        return c('div', [
          c('div', [
            c('input', { id: 'name', type: 'text' }),
            c('button', { click: () => dispatch({ type: 'WELCOME', name: document.querySelector('#name').value }) }, 'welcome')
          ]),
          c('div', { style: `visibility: ${ state.name.length ? 'visible' : 'hidden' };` }, `Hello, ${ state.name }!`)
        ]);
      };

      let app = createApplication(initialState, update, view);

      app.mount(document.querySelector('#app'));
    </script>
  </body>
  </html>
```
