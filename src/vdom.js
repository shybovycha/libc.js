import * as utils from './utils.js';

export let isDOM = val => VirtualDOMNode.prototype.isPrototypeOf(val);

export class VirtualDOMNode {
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
        return (this.elt && node.elt && this.elt == node.elt) && (this.text == node.text) && utils.deepEqual(this.attributes, node.attributes) && this.children.every((child, index) => child.equal(node.children[index]));
    }

    applyChanges(elt2) {
        if (!this.elt) {
            this.materialize();
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

        if (attributes && !utils.deepEqual(this.attributes, attributes)) {
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

        utils.setImmediate(_ => {
            this.children.forEach(child => child.materialize(this.elt))
        });

        if (this.parent && this.parent.elt) {
            this.parent.elt.appendChild(this.elt);
        } else if (placeholder) {
            placeholder.appendChild(this.elt);
        }
    }
}

export class C {
    constructor(tagName, _arg1, _arg2) {
        let children, attrs, elt;

        if (utils.isArray(_arg1)) {
            children = _arg1.slice();
        } else if (utils.isObject(_arg1)) {
            attrs = _arg1;

            if (utils.isArray(_arg2))
                children = _arg2.slice();
            else
                children = [_arg2];
        } else {
            children = [_arg1];
        }

        children = children ? utils.flatten(children) : [];
        attrs = attrs || {};

        elt = new VirtualDOMNode(tagName);

        Object.keys(attrs).forEach((attrName) => {
            let attrValue = attrs[attrName];

            if (utils.isFunction(attrValue)) {
                elt.addEventListener(attrName, attrValue);
            } else {
                elt.setAttribute(attrName, attrValue);
            }
        });

        children.forEach((child) => {
            if (typeof (child) === 'undefined' || child == null)
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

export let c = (tagName, _arg1, _arg2) => new C(tagName, _arg1, _arg2);
