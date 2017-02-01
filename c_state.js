// utility functions, required by Store
let getType = val => Object.prototype.toString.call(val);

let isObject = val => val !== null && getType(val) === '[object Object]';

let isArray = val => getType(val) === '[object Array]';

// deep object comparison
let deepEqual = (obj1, obj2) => {
  if ((obj1 === null && obj2 !== null) || (obj1 === null && obj2 !== null))
    return false;

  if (obj1 === null && obj2 === null)
    return true;

  if ((!isObject(obj1) && isObject(obj2)) || (isObject(obj1) && !isObject(obj2)))
    return false;

  if (!isObject(obj1) && !isObject(obj2) && !isArray(obj1) && !isArray(obj2))
    return obj1 == obj2;

  let keys1 = Object.keys(obj1);

  for (key of keys1) {
    if (!obj2.hasOwnProperty(key))
      return false;

    if (!deepEqual(obj1[key], obj2[key]))
      return false;
  }

  let keys2 = Object.keys(obj2);

  for (key of keys2) {
    if (!obj1.hasOwnProperty(key))
      return false;

    if (!deepEqual(obj1[key], obj2[key]))
      return false;
  }

  return true;
};

// the power of duct typing!
Object.deepEqual = deepEqual;

// NodeJS polyfill to enqueue function
let setImmediate = fn => setTimeout(fn, 0);

// neat recursive implementation of array flattening
let flatten = (val, result) => {
  if (!isArray(val))
    return val;

  if (!result)
    result = [];

  val.forEach(function (elem) {
    if (isArray(elem)) {
      flatten(elem, result);
    } else {
      result.push(elem);
    }
  });

  return result;
};

// chunking array will be handy for matches processing
let inChunksOf = (val, n) => {
  if (!isArray(val))
   return val;

  return val.reduce(function (acc, elem) {
    if (acc[acc.length - 1].length == n)
      acc.push([]);

    acc[acc.length - 1].push(elem);

    return acc;
  }, [[]]);
};

Array.prototype.flatten = () => flatten(this);

Array.prototype.inChunksOf = n => inChunksOf(this, n);

// Redux-like store
class Store {
  constructor(initialState) {
    this.state = Object.assign({}, initialState);
    this.listeners = [];
    this.reducers = [];
  }

  static createStore(initialState) {
    return new Store(initialState);
  }

  getState() {
    return Object.assign({}, this.state);
  }

  onAction(fn) {
    this.reducers.push(fn);
  }

  onStateChanged(fn) {
    this.listeners.push(fn);
  }

  // dispatch an action; enqueue all the reducing and listeners logic in the event queue
  // thus preventing an app from freezing
  // this is how the data actually flows: we first dispatch a message to the store,
  // store runs reducers and checks whether state has changed
  // in case it has changed - we then fire all the listeners, which may dispatch more messages
  // I didn't make that in the reducer itself so the reducers might be thin and they do not require the
  // cyclic store dependency/parameter.
  // e.g. reducers operate with the state only,
  // listeners/UI may dispatch messages - divide & conquer
  dispatch(action) {
    setImmediate(_ => {
      // calculate the new state
      let oldState = Object.assign({}, this.state);
      let newState = this.reducers.reduce((acc, reducer) => reducer(acc, action), oldState);

      // if state is unchanged - nothing to update
      if (Object.deepEqual(newState, oldState))
        return;

      this.state = newState;

      // otherwise notify the listeners
      this.listeners.forEach(listener => listener(newState, oldState));
    });
  }
}