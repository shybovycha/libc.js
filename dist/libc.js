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
        return (this.elt && node.elt && this.elt == node.elt) && (this.innerText == node.innerText) && deepEqual(this.attributes, node.attributes) && this.children.every((child, index) => child.equal(node.children[index]));
    }

    applyChanges(elt2) {
        if (!this.elt) {
            this.mount();
        }

        let [children, attributes, text] = [elt2.children, elt2.attributes, elt2.innerText];

        for (let index = 0; index < children.length; index++) {
            let newChild = children[index];

            if (index >= this.children.length) {
                this.children.push(newChild);
                newChild.parent = this;
            } else if (this.children[index].equal(newChild)) {
                continue;
            }

            this.children[index].applyChanges(newChild);
        }

        for (let index = children.length; index < this.children.length; index++) {
            this.elt.removeChild(this.children[index].elt);
        }

        this.children = this.children.slice(0, children.length);

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
            this.children.filter(child => !child.elt).forEach(child => child.mount(this.elt));
        });

        if (this.parent && this.parent.elt) {
            this.parent.elt.appendChild(this.elt);
        } else if (placeholder) {
            placeholder.appendChild(this.elt);
        }
    }
}

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

class ComponentInstance {
    constructor(viewFn, updateFn) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;
    }

    render() {
        let newView = this.viewFn.call(null, this.store.getState(), this.children, this.store.dispatch.bind(this.store));

        if (!this.view)
            this.view = newView; else
                this.view.applyChanges(newView);

        return this.view;
    }

    init(store, children) {
        this.store = store;
        this.children = children;

        this.store.onAction(this.updateFn.bind(this));
        this.store.onStateChanged(this.render.bind(this));

        return this;
    }

    mount(placeholder) {
        this.render().mount(placeholder);
        return this;
    }
}

class ComponentFactory {
    constructor(viewFn, updateFn, storeFactory) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;
        this.storeFactory = storeFactory;
    }

    init(state, children) {
        let component = new ComponentInstance(this.viewFn, this.updateFn);
        let store = this.storeFactory.call(null, state);
        return component.init(store, children);
    }
}

let createComponent = (viewFn, updateFn) => new ComponentFactory(viewFn, updateFn || ((state, message) => state), ((state) => new Store(state)));

let connectComponentToStore = function (componentFactory, store) {
    componentFactory.storeFactory = (state) => {
        store.state = Object.assign({}, store.getState(), state);
        return store;
    };

    return componentFactory;
};

/**
 *
 * @param {String|ComponentFactory} _arg0 Tag name or component
 * @param {Object} [_arg1] In case of HTML tags - attributes and event listeners; in case of components - initial state. Or children. Or inner text.
 * @param {Array<VirtualDOMNode>|Array<ComponentFactory>|String} [_arg2] Children nodes or inner text
 */
let c = function (_arg0, _arg1, _arg2) {
    let elt, children = [], attrs = {}, innerText;

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

    if (ComponentFactory.prototype.isPrototypeOf(_arg0)) {
        return _arg0.init(attrs, children || innerText);
    }

    elt = new VirtualDOMNode(_arg0);

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

        if (VirtualDOMNode.prototype.isPrototypeOf(child)) {
            elt.appendChild(child);
        } else {
            elt.appendChild(child.render());
        }
    });

    elt.innerText = innerText;

    return elt;
};

if (typeof window !== 'undefined') {
  window.createComponent = createComponent;
  window.createStore = Store.createStore;
  window.connectComponentToStore = connectComponentToStore;
  window.c = c;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { createComponent, createStore: Store.createStore, c };
}
