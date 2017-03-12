import { VirtualDOMNode } from './vdom.js';

import * as utils from './utils.js';

export function createComponent(viewFn, updateFn) {
    let view = null, state = null, children = null;

    let dispatch = function (message) {
        let newState = updateFn.call(null, state, message);

        if (utils.deepEqual(newState, state))
            return;

        state = newState;

        utils.setImmediate(render);
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
};

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

    if (utils.isFunction(_arg0)) {
        return _arg0.call(null, attrs, children || innerText);
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
