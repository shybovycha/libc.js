'use strict';

let getType = val => Object.prototype.toString.call(val);

let isObject = val => val !== null && getType(val) === '[object Object]';

let isArray = val => getType(val) === '[object Array]';



let isFunction = val => getType(val) === '[object Function]';



let setImmediate = fn => setTimeout(fn, 0);

let deepCopy = (val) => {
    if (isArray(val))
        return [].slice.call(val);

    if (!isObject(val))
        return val;

    let ret = {};

    Object.keys(val).forEach(k => ret[k] = deepCopy(val[k]));

    return ret;
};

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

class VirtualDOMNode {
    constructor(tagName) {
        this.tagName = tagName;

        this.attributes = {};
        this.children = [];
        this.innerText = null;

        this.parent = null;

        this.elt = null;

        this.eventListeners = {};
    }

    appendChild(elt) {
        elt.parent = this;
        this.children.push(elt);
    }

    setAttribute(attr, val) {
        if (!!val)
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
        return (this.elt && node.elt && this.elt == node.elt) && (this.text == node.text) && deepEqual(this.attributes, node.attributes) && this.children.every((child, index) => child.equal(node.children[index]));
    }

    applyChanges(elt2) {
        if (!this.elt) {
            this.mount();
        }

        let [children, attributes, text] = [elt2.children, elt2.attributes, elt2.innerText];

        children.forEach((newChild, index) => {
            if (index >= this.children.length) {
                this.children.push(newChild);
            } else if (this.children[index].equal(newChild)) {
                return;
            }

            this.children[index].applyChanges(newChild);
        });

        if (attributes && !deepEqual(this.attributes, attributes)) {
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

    mount(placeholder) {
        this.elt = document.createElement(this.tagName);

        if (typeof this.innerText !== 'undefined' && this.innerText !== null)
            this.elt.innerText = this.innerText;

        Object.keys(this.attributes).forEach(key => this.elt.setAttribute(key, this.attributes[key]));

        Object.keys(this.eventListeners).forEach(evtName => {
            this.eventListeners[evtName].forEach(listener => this.elt.addEventListener(evtName, listener.bind(this.elt)));
        });

        setImmediate(_ => {
            this.children.forEach(child => child.mount(this.elt));
        });

        if (this.parent && this.parent.elt) {
            this.parent.elt.appendChild(this.elt);
        } else if (placeholder) {
            placeholder.appendChild(this.elt);
        }
    }
}

class Component {
    constructor(viewFn, updateFn) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;

        this.view = null;
        this.state = null;
        this.children = null;
    }

    dispatch(message) {
        let newState = this.updateFn.call(null, this.state, message);

        if (deepEqual(newState, this.state))
            return;

        this.state = newState;

        setImmediate(this.render.bind(this));
    }

    render() {
        let newView = c.apply(null, this.viewFn.call(null, this.state, this.children, this.dispatch.bind(this)));

        if (!this.view)
            this.view = newView; else
                this.view.applyChanges(newView);

        return this.view;
    }

    init(state, children) {
        this.state = state;
        this.children = children;

        return this;
    }

    mount(placeholder) {
        this.render().mount(placeholder);
        return this;
    }
}

class ComponentFactory {
    constructor(viewFn, updateFn) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;
    }

    init(state, children) {
        let component = new Component(this.viewFn, this.updateFn);
        return component.init(state, children);
    }
}

let createComponent = (viewFn, updateFn) => new ComponentFactory(viewFn, updateFn || ((state, message) => state));

let isDOM$$1 = (_arg0) => VirtualDOMNode.prototype.isPrototypeOf(_arg0);

let c = function (_arg0, _arg1, _arg2) {
    let elt = null, children = [], attrs = {}, innerText = null;

    if (isArray(_arg1)) {
        children = _arg1.slice();
    } else if (isObject(_arg1)) {
        attrs = _arg1;

        if (isArray(_arg2))
            children = _arg2.slice();
        else
            innerText = _arg2;
    } else {
        innerText = _arg1;
    }

    if (ComponentFactory.prototype.isPrototypeOf(_arg0) || Component.prototype.isPrototypeOf(_arg0)) {
        return _arg0.init(attrs, children.map(child => isDOM$$1(child) ? child : c.apply(null, child)) || innerText).render();
    } else {
        elt = new VirtualDOMNode(_arg0);
    }

    Object.keys(attrs).forEach((attrName) => {
        let attrValue = attrs[attrName];

        if (isFunction(attrValue)) {
            elt.addEventListener(attrName, attrValue);
        } else {
            elt.setAttribute(attrName, attrValue);
        }
    });

    children.forEach((child) => {
        if (typeof (child) === 'undefined' || child == null)
            return;

        if (isDOM$$1(child)) {
            elt.appendChild(child);
        } else {
            elt.appendChild(c.apply(null, child));
        }
    });

    elt.innerText = innerText;

    return elt;
};

class Store {
    constructor(initialState) {
        this.state = deepCopy(initialState);
        this.listeners = [];
        this.reducers = [];
    }

    static createStore(initialState) {
        return new Store(initialState);
    }

    getState() {
        return deepCopy(this.state);
    }

    onAction(fn) {
        this.reducers.push(fn);
    }

    onStateChanged(fn) {
        this.listeners.push(fn);
    }

    dispatch(action) {
        setImmediate(_ => {
            let oldState = deepCopy(this.state);
            let newState = this.reducers.reduce((acc, fn) => fn.call(null, acc, action), this.state);

            if (deepEqual(newState, oldState))
                return;

            this.state = newState;
            this.listeners.forEach(fn => fn.call(null, newState, oldState));
        });
    }
}

if (typeof window !== 'undefined') {
  window.createComponent = createComponent;
  window.createStore = Store.createStore;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { createComponent, createStore: Store.createStore };
}
