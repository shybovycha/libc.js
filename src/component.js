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
};

export class ComponentFactory {
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
};

export let createComponent = (viewFn, updateFn) => new ComponentFactory(viewFn, updateFn || ((state, message) => state), ((state) => new Store(state)));

export let connectComponentToStore = function (componentFactory, store) {
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
        } else if (ComponentInstance.prototype.isPrototypeOf(child)) {
            elt.appendChild(child.render());
        }
    });

    elt.innerText = innerText;

    return elt;
};
