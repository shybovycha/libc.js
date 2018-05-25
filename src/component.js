import { VirtualDOMNode } from './vdom.js';

import * as utils from './utils.js';

/**
 *
 * @param {String|Function} _arg0 Tag name or component's view() function
 * @param {Object} [_arg1] In case of HTML tags - attributes and event listeners; in case of components - initial state. Or children. Or inner text.
 * @param {Array<VirtualDOMNode>|String} [_arg2] Children nodes or inner text
 */
export let c = function (_arg0, _arg1, _arg2) {
    let elt, children = [], attrs = {}, innerText;

    if (utils.isFunction(_arg0)) {
        return _arg0.apply(null, [].slice.apply(arguments).slice(1));
    }

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
        }
    });

    elt.innerText = innerText;

    return elt;
};

export let connectToStore = (renderFn, store) => {
    let render = () => renderFn.call(null, store.getState());

    let vdomnode = render();

    store.onStateChanged(() => vdomnode.applyChanges(render()));

    return vdomnode;
};
