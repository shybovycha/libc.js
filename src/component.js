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

/**
 * Connect a component to a store.
 *
 * @param {Array<*>|Function<*>} arg1 Either a list of selectors, or component's render function
 * @param {Function<*>|Store} arg2 Either component's render function or a Store object to connect to
 * @param {Store?} arg3 When called with selectors name list, this should be a store
 */
export let connectToStore = (arg1, arg2, arg3) => {
    let selectors = null;
    let renderFn = null;
    let store = null;

    if (utils.isArray(arg1)) {
        selectors = arg1;
        renderFn = arg2;
        store = arg3;
    } else {
        renderFn = arg1;
        store = arg2;
    }

    let vdomnode = null;

    let render = () => renderFn.call(null, store.getState());

    let update = () => {
        if (!vdomnode) {
            vdomnode = render();
            return;
        }

        vdomnode.applyChanges(render());
    };

    if (!selectors || selectors.length < 1) {
        store.onStateChanged(update);
    } else {
        store.onStateChanged(selectors, update);
    }

    return {
        mount(domnode) {
            // TODO: do not actually mount to domnode, but rather just remember this node in a closure
            // when a component will be rendered, if it is not mounted yet it has where to, mount it before rendering
        }
    };
};
