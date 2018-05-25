# libc

`libc` is a javascript framework which allows to create fast and robust applications.
It has been highly inspired by [Redux](http://redux.js.org/) and [Elm](http://elm-lang.org)
architectures and [Mithrill](http://mithril.js.org) library.

## Build

Prior to building a library, you'll need to install development tools: `npm install`.

To build libc with ES6 syntax use `npm run-script build`.

## Examples

All the examples could be found in the [`examples/`](https://github.com/shybovycha/libc.js/tree/master/examples) directory.

## TODO

### Re-frame-like API

1. create view:

```js
    const itemList = items =>
        c('div', items.map(({ title, id }) =>
            c('div', [
                c('span', title),
                c('button', { click: dispatch({ deleteItem: id }) }, 'x')
            ])
        ));
```

2. register event handler:

```js
    // note that the message here is the value in the object, passed to `dispatch()`, corresponding to the `deleteItem` key
    registerEvent('deleteItem', (state, message) => {
        ajax.delete(`/items/${ message }`)
            .then(itemsAfterDelete =>
                dispatch({ itemDeleted: { items: itemsAfterDelete } })
            );

        // return an empty effect like nothing had happened
        return {};

        // alternatively, return the new state
        return { db: { disabledItems: [ message ] } };
    });

    // an event, which will be triggered once AJAX request is completed
    registerEvent('itemDeleted', (state, message) => ({ itemDeleted: message.items }));

    // this same thing, but without a custom effect handler
    registerEvent('itemDeleted', (state, message) => ({ db: { items: message.items } }));
```

3. _(optional)_ register effect handler:

```js
    // handle the effect
    registerEffect('itemDeleted', (state, message) =>
        ({ ...state, items: message.items })
    );
```

4. subscribe to state change:

```js
    // view will be called whenever state changes
    subscribe(state => itemList(state.items));
```

5. _(optional)_ use selectors:

```js
    // create a selector, a memoized function, which returns portion of a state only
    createSelector('itemsSelector', state => state.items);

    // view will be called only when one or more of its selectors returns a different value
    subscribe([ 'itemsSelector' ], ([ items ]) => itemList(items));
```

So the principle here is:

1. view dispatches a message (event)
2. _(optional)_ an event handler picks up the message and dispatches another message (effect)
3. an effect handler picks up the message and returns a new state
4. all handlers, subscribed to the state change, are checked whether they require any selectors to change their state or not
  1. if not - views are just updated
  2. otherwise - all the selectors required are executed and, if any one of them return a new value (compared to their memoized state) - the view is updated

In order to change a state straight with the `dispatch` function call, use the `db` effect. Its handler should be registered immediately after store is created.

This way the API will expose a few functions: `c`, `registerEvent`, `registerEffect`, `createSelector`, `subscribe` and `dispatch`.

Store should be created on the first `subscribe` call, if no store exists so far.

There should also be a way to set the initial state for a store in this API design. It could either be a separate function like `initialState` or (discouraged) a special effect, like `init`, which will be dispatched after a store is created.

### Optimize the `deepEqual` and `deepCopy` functions

Those two are the most often called and yet the most expensive ones.
