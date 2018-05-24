import * as utils from './utils.js';

export let isDOM = val => VirtualDOMNode.prototype.isPrototypeOf(val);

export class VirtualDOMNode {
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
        if (val) {
            this.attributes[attr] = val;
        } else {
            delete this.attributes[attr];
        }
    }

    getAttribute(attr) {
        return this.attributes[attr];
    }

    removeChild(elt) {
        let idx = this.children.indexOf(elt);

        if (idx < 0) {
            throw 'Children not found';
        }

        this.children = this.children.slice(0, idx).concat(idx + 1, this.children.length);
    }

    addEventListener(evtName, handler) {
        if (!this.eventListeners[evtName]) {
            this.eventListeners[evtName] = [];
        }

        this.eventListeners[evtName].push(handler);
    }

    dispatchEvent(evt) {
        if (!evt.type || !this.eventListeners[evt.type]) {
            return;
        }

        this.eventListeners[evt.type].forEach(fn => fn.call(this, evt));
    }

    removeEventListener(evtName, handler) {
        const listeners = this.eventListeners[evtName];

        if (!listeners) {
            return;
        }

        const idx = listeners.indexOf(handler);

        this.eventListeners[evtName].splice(idx, 1);
    }

    get value() {
        if (this.elt) {
            return this.elt.value;
        }

        return undefined;
    }

    equal(node) {
        return (this.elt && node.elt && this.elt == node.elt) &&
            ((this.tagName == 'input' && this.value == node.value) || (this.tagName != 'input' && this.innerText == node.innerText)) &&
            utils.deepEqual(this.attributes, node.attributes) &&
            this.children.every((child, index) => child.equal(node.children[index]));
    }

    applyChanges(elt2) {
        if (this.equal(elt2)) {
            return;
        }

        if (!this.elt) {
            this.mount();
        }

        let { children, attributes, eventListeners, innerText } = elt2;

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
            if (this.children[index].elt && this.children[index].elt.parentNode == this.elt) {
                this.elt.removeChild(this.children[index].elt);
            }
        }

        this.children = this.children.slice(0, children.length);

        if (attributes && !utils.deepEqual(this.attributes, attributes)) {
            Object.keys(attributes).forEach(key => {
                let value = attributes[key];

                // skip equal attributes
                if (this.attributes[key] == value) {
                    return;
                }

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

        if (eventListeners && !utils.deepEqual(this.eventListeners, eventListeners)) {
            Object.keys(this.eventListeners).forEach(event => {
                this.eventListeners[event].forEach(handler => {
                    this.elt.removeEventListener(event, handler);
                });

                delete this.eventListeners[event];
            });

            Object.keys(eventListeners).forEach(event => {
                eventListeners[event].forEach(handler => {
                    if (!this.eventListeners[event]) {
                        this.eventListeners[event] = [];
                    }

                    this.eventListeners[event].push(handler);
                    this.elt.addEventListener(event, handler);
                });
            });
        }

        if (innerText && innerText != this.innerText) {
            this.innerText = innerText;

            if (this.tagName == 'input') {
                this.elt.value = innerText;
            } else {
                this.elt.innerText = innerText;
            }
        }
    }

    mount(placeholder) {
        this.elt = document.createElement(this.tagName);

        if (typeof this.innerText !== 'undefined' && this.innerText !== null) {
            this.elt.innerText = this.innerText;
        }

        Object.keys(this.attributes).forEach(key => this.elt.setAttribute(key, this.attributes[key]));

        Object.keys(this.eventListeners).forEach(evtName => {
            this.eventListeners[evtName]
                .forEach(listener => this.elt.addEventListener(evtName, listener, false));
        });

        utils.setImmediate(() => {
            this.children
                .filter(child => !child.elt)
                .forEach(child => child.mount(this.elt));
        });

        if (this.parent && this.parent.elt) {
            this.parent.elt.appendChild(this.elt);
        } else if (placeholder) {
            placeholder.appendChild(this.elt);
        }
    }

    unmount() {
        if (this.elt) {
            this.elt.parentNode.removeChild(this.elt);
        }
    }
}
