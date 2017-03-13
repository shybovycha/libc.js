import { VirtualDOMNode } from './vdom.js';

import * as utils from './utils.js';

export class Component {
    constructor(viewFn, updateFn) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;

        this.view = null;
        this.state = null;
        this.children = null;
    }

    dispatch(message) {
        let newState = this.updateFn.call(null, this.state, message);

        if (utils.deepEqual(newState, this.state))
            return;

        this.state = newState;

        utils.setImmediate(this.render.bind(this));
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
};

export class ComponentFactory {
    constructor(viewFn, updateFn) {
        this.viewFn = viewFn;
        this.updateFn = updateFn;
    }

    init(state, children) {
        let component = new Component(this.viewFn, this.updateFn);
        return component.init(state, children);
    }
};

export let createComponent = (viewFn, updateFn) => new ComponentFactory(viewFn, updateFn || ((state, message) => state));

export let isDOM = (_arg0) => VirtualDOMNode.prototype.isPrototypeOf(_arg0);

export let c = function (_arg0, _arg1, _arg2) {
    let elt = null, children = [], attrs = {}, innerText = null;

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

    if (ComponentFactory.prototype.isPrototypeOf(_arg0) || Component.prototype.isPrototypeOf(_arg0)) {
        return _arg0.init(attrs, children.map(child => isDOM(child) ? child : c.apply(null, child)) || innerText).render();
    } else {
        elt = new VirtualDOMNode(_arg0);
    }

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
        } else {
            elt.appendChild(c.apply(null, child));
        }
    });

    elt.innerText = innerText;

    return elt;
};
