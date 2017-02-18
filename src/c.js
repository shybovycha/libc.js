;(function () {
  'use strict';

  let getType = val => Object.prototype.toString.call(val);

  let isObject = val => val !== null && getType(val) === '[object Object]';

  let isArray = val => getType(val) === '[object Array]';

  let isString = val => getType(val) === '[object String]';

  let isFunction = val => getType(val) === '[object Function]';

  let isDOM = val => VirtualDOMNode.prototype.isPrototypeOf(val);

  let deepCopy = (val) => {
    if (isArray(val))
      return [].slice.call(val);

    if (!isObject(val))
      return val;

    let ret = {};

    Object.keys(val).forEach(k => ret[k] = deepCopy(val[k]));

    return ret;
  };

  let flatten = arr => arr.reduce((acc, e) => acc.concat(isArray(e) ? flatten(e) : [e]), []);

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

    for (let key of keys1) {
      if (!obj2.hasOwnProperty(key))
        return false;

      if (!deepEqual(obj1[key], obj2[key]))
        return false;
    }

    let keys2 = Object.keys(obj2);

    for (let key of keys2) {
      if (!obj1.hasOwnProperty(key))
        return false;

      if (!deepEqual(obj1[key], obj2[key]))
        return false;
    }

    return true;
  };

  Object.deepEqual = deepEqual;
  Object.deepCopy = deepCopy;

  let setImmediate = fn => setTimeout(fn, 0);

  class VirtualDOMNode {
    constructor(tagName, attributes, children, text) {
      this.tagName = tagName;

      this.attributes = attributes || {};
      this.children = children || [];
      this.innerText = text || null;

      this.parent = null;

      this.elt = null;

      this.eventListeners = {};
    }

    appendChild(elt) {
      elt.parent = this;
      this.children.push(elt);
    }

    setAttribute(attr, val) {
      this.attributes[attr] = val;
    }

    getAttribute(attr) {
      return this.attributes[attr];
    }

    removeChild(elt) {
      let idx = this.children.indexOf(elt);

      if (idx < 0)
        throw 'Children not found';

      this.children = this.children.slice(0, idx).concat(idx + 1, this.children.length);
    }

    addEventListener(evtName, handler) {
      if (!this.eventListeners[evtName])
        this.eventListeners[evtName] = [];

      this.eventListeners[evtName].push(handler);
    }

    dispatchEvent(evt) {
      if (!evt.type || !this.eventListeners[evt.type])
        return;

      this.eventListeners[evt.type].forEach(fn => fn.call(this, evt));
    }

    removeEventListener(evtName, handler) {
      let listeners = this.eventListeners[evtName];

      if (!listeners)
        return;

      let idx = listeners.indexOf(handler);

      this.eventListeners[evtName] = listeners.slice(0, idx).concat(listeners.slice(idx, listeners.length));
    }

    equal(node) {
      return (this.elt && node.elt && this.elt == node.elt) && (this.text == node.text) && Object.deepEqual(this.attributes, node.attributes) && this.children.every((child, index) => child.equal(node.children[index]));
    }

    applyChanges(elt2) {
      if (!this.elt) {
        this.materialize();
      }

      let [ children, attributes, text ] = [ elt2.children, elt2.attributes, elt2.innerText ];

      children.forEach((newChild, index) => {
        if (index >= this.children.length) {
          this.children.push(newChild);
        } else if (this.children[index].equal(newChild)) {
          return;
        }

        this.children[index].applyChanges(newChild);
      });

      if (attributes && !Object.deepEqual(this.attributes, attributes)) {
        Object.keys(attributes).forEach(key => {
          let value = attributes[key];

          if (this.attributes[key] == value)
            return;

          this.attributes[key] = value;
          this.elt.setAttribute(key, value);
        });

        Object.keys(this.attributes).forEach(key => {
          if (typeof attributes[key] === 'undefined') {
            delete this.attributes[key];
            this.elt.removeAttribute(key);
          }
        });
      }

      if (text && text != this.innerText) {
        this.innerText = text;
        this.elt.innerText = text;
      }
    }

    materialize(placeholder) {
      this.elt = document.createElement(this.tagName);

      if (typeof this.innerText !== 'undefined' && this.innerText !== null)
        this.elt.innerText = this.innerText;

      Object.keys(this.attributes).forEach(key => this.elt.setAttribute(key, this.attributes[key]));

      Object.keys(this.eventListeners).forEach(evtName => {
        this.eventListeners[evtName].forEach(listener => this.elt.addEventListener(evtName, listener.bind(this.elt)));
      });

      setImmediate(_ => {
        this.children.forEach(child => child.materialize(this.elt))
      });

      if (this.parent && this.parent.elt) {
        this.parent.elt.appendChild(this.elt);
      } else if (placeholder) {
        placeholder.appendChild(this.elt);
      }
    }
  }

  class C {
    constructor(tagName, _arg1, _arg2) {
      let children, attrs, elt;

      if (isArray(_arg1)) {
        children = _arg1.slice();
      } else if (isObject(_arg1)) {
        attrs = _arg1;

        if (isArray(_arg2))
          children = _arg2.slice();
        else
          children = [_arg2];
      } else {
        children = [_arg1];
      }

      children = children ? flatten(children) : [];
      attrs = attrs || {};

      elt = new VirtualDOMNode(tagName);

      Object.keys(attrs).forEach((attrName) => {
        let attrValue = attrs[attrName];

        if (isFunction(attrValue)) {
          elt.addEventListener(attrName, attrValue);
        } else {
          elt.setAttribute(attrName, attrValue);
        }
      });

      children.forEach((child) => {
        if (typeof(child) === 'undefined' || child == null)
          return;

        if (isDOM(child)) {
          elt.appendChild(child);
        } else if (child instanceof C) {
          elt.appendChild(child.elt);
        } else {
          elt.innerText = child;
        }
      });

      this.elt = elt;
    }

    mount(placeholder) {
      this.elt.materialize(placeholder);
    }

    unmount() {
      this.elt.parentElement.removeChild(this.elt);
    }

    on(evt, cb, sink) {
      this.elt.addEventListener(evt, cb.bind(this), sink);
    }

    fire(evtName) {
      var evt = new Event(evtName, [].slice.apply(arguments, 1));
      this.elt.dispatchEvent(evt);
    }
  }

  let c = (tagName, _arg1, _arg2) => new C(tagName, _arg1, _arg2);

  class Store {
    constructor(initialState) {
      this.state = Object.deepCopy(initialState);
      this.listener = () => null;
      this.reducer = (state, _) => state;
    }

    static createStore(initialState) {
      return new Store(initialState);
    }

    getState() {
      return Object.deepCopy(this.state);
    }

    onAction(fn) {
      this.reducer = fn;
    }

    onStateChanged(fn) {
      this.listener = fn;
    }

    dispatch(action) {
      setImmediate(_ => {
        let oldState = Object.deepCopy(this.state);
        let newState = this.reducer(this.state, action);

        if (Object.deepEqual(newState, oldState))
          return;

        this.state = newState;
        this.listener(newState, oldState);
      });
    }
  }

  class Application {
    constructor(initialState, updateFn, viewFn) {
      this.store = new Store(initialState);

      this.updateFn = updateFn;
      this.viewFn = viewFn;

      this.view = null;

      this.store.onAction(this._onAction.bind(this));
      this.store.onStateChanged(this._onStateChanged.bind(this));
    }

    mount(placeholder) {
      this.view = this.viewFn.call(null, this.store.getState(), this.dispatch.bind(this));
      this.view.elt.materialize(placeholder);
    }

    dispatch(message) {
      this.store.dispatch(message);
    }

    _onAction(state, message) {
      return this.updateFn.call(null, state, message);
    }

    _onStateChanged(state) {
      let newView = this.viewFn.call(null, state, this.dispatch.bind(this));
      this.view.elt.applyChanges(newView.elt);
    }
  }

  let createApplication = (initialState, updateFn, viewFn) => new Application(initialState, updateFn, viewFn);

  if (typeof window !== 'undefined') {
    window.c = c;
    window.createApplication = createApplication;
  } else if (typeof module === 'object' && module != null && module.exports) {
    module.exports = { c, createApplication };
  } else {
    return c;
  }
})();
