'use strict';

let getType = val => Object.prototype.toString.call(val);

let isObject = val => val !== null && getType(val) === '[object Object]';

let isArray = val => getType(val) === '[object Array]';



let isFunction = val => getType(val) === '[object Function]';



let setImmediate = fn => setTimeout(fn, 0);



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

function createComponent(viewFn, updateFn) {
    let view = null, state = null, children = null;

    let dispatch = function (message) {
        let newState = updateFn.call(null, state, message);

        if (deepEqual(newState, state))
            return;

        state = newState;

        setImmediate(render);
    };

    let render = function () {
        let newView = c.apply(null, viewFn.call(null, state, children, dispatch));

        if (!view)
            view = newView; else
                view.applyChanges(newView);

        return view;
    };

    return function (initialState, initialChildren) {
        state = initialState;
        children = (initialChildren || []).map(childParams => c.apply(null, childParams));
        return render();
    };
}

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

    if (isFunction(_arg0)) {
        return _arg0.call(null, attrs, children || innerText);
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

if (typeof window !== 'undefined') {
  window.createComponent = createComponent;
} else if (typeof module === 'object' && module != null && module.exports) {
  module.exports = { createComponent };
}