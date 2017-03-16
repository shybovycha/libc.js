import { VirtualDOMNode } from './vdom.js';
import { Store } from './store.js';

import * as utils from './utils.js';

export class ComponentInstance {
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

    init(state, children) {
        this.store = new Store(state);
        this.children = children;

        this.store.onAction(this.updateFn.bind(this));
        this.store.onStateChanged(this.render.bind(this));

        return this;
    }

    mount(placeholder) {
        this.render().mount(placeholder);
        return this;
    }
};

export class ComponentFactory {
    constructor(viewFn, updateFn) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;
    }

    init(state, children) {
        let component = new ComponentInstance(this.viewFn, this.updateFn);
        return component.init(state, children);
    }
};

export let createComponent = (viewFn, updateFn) => new ComponentFactory(viewFn, updateFn || ((state, message) => state));

export let c = function (_arg0, _arg1, _arg2) {
    let elt, children = [], attrs = {}, innerText;

    if (utils.isArray(_arg1)) {
        children = _arg1.slice();
    } else if (utils.isObject(_arg1)) {
        attrs = _arg1;

        if (utils.isArray(_arg2))
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

        if (utils.isFunction(attrValue)) {
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
