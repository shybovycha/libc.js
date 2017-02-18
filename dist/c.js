'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var getType = function getType(val) {
        return Object.prototype.toString.call(val);
    };

    var isObject = function isObject(val) {
        return val !== null && getType(val) === '[object Object]';
    };

    var isArray = function isArray(val) {
        return getType(val) === '[object Array]';
    };

    var isFunction = function isFunction(val) {
        return getType(val) === '[object Function]';
    };

    var flatten = function flatten(arr) {
        return arr.reduce(function (acc, e) {
            return acc.concat(isArray(e) ? flatten(e) : [e]);
        }, []);
    };

    var setImmediate = function setImmediate(fn) {
        return setTimeout(fn, 0);
    };

    var deepCopy = function deepCopy(val) {
        if (isArray(val)) return [].slice.call(val);

        if (!isObject(val)) return val;

        var ret = {};

        Object.keys(val).forEach(function (k) {
            return ret[k] = deepCopy(val[k]);
        });

        return ret;
    };

    var deepEqual = function deepEqual(obj1, obj2) {
        if (obj1 === null && obj2 !== null || obj1 === null && obj2 !== null) return false;

        if (obj1 === null && obj2 === null) return true;

        if (!isObject(obj1) && isObject(obj2) || isObject(obj1) && !isObject(obj2)) return false;

        if (!isObject(obj1) && !isObject(obj2) && !isArray(obj1) && !isArray(obj2)) return obj1 == obj2;

        var keys1 = Object.keys(obj1);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = keys1[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var key = _step.value;

                if (!obj2.hasOwnProperty(key)) return false;

                if (!deepEqual(obj1[key], obj2[key])) return false;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        var keys2 = Object.keys(obj2);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = keys2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _key = _step2.value;

                if (!obj1.hasOwnProperty(_key)) return false;

                if (!deepEqual(obj1[_key], obj2[_key])) return false;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return true;
    };

    var isDOM = function isDOM(val) {
        return VirtualDOMNode.prototype.isPrototypeOf(val);
    };

    var VirtualDOMNode = function () {
        function VirtualDOMNode(tagName, attributes, children, text) {
            _classCallCheck(this, VirtualDOMNode);

            this.tagName = tagName;

            this.attributes = attributes || {};
            this.children = children || [];
            this.innerText = text || null;

            this.parent = null;

            this.elt = null;

            this.eventListeners = {};
        }

        _createClass(VirtualDOMNode, [{
            key: 'appendChild',
            value: function appendChild(elt) {
                elt.parent = this;
                this.children.push(elt);
            }
        }, {
            key: 'setAttribute',
            value: function setAttribute(attr, val) {
                this.attributes[attr] = val;
            }
        }, {
            key: 'getAttribute',
            value: function getAttribute(attr) {
                return this.attributes[attr];
            }
        }, {
            key: 'removeChild',
            value: function removeChild(elt) {
                var idx = this.children.indexOf(elt);

                if (idx < 0) throw 'Children not found';

                this.children = this.children.slice(0, idx).concat(idx + 1, this.children.length);
            }
        }, {
            key: 'addEventListener',
            value: function addEventListener(evtName, handler) {
                if (!this.eventListeners[evtName]) this.eventListeners[evtName] = [];

                this.eventListeners[evtName].push(handler);
            }
        }, {
            key: 'dispatchEvent',
            value: function dispatchEvent(evt) {
                var _this = this;

                if (!evt.type || !this.eventListeners[evt.type]) return;

                this.eventListeners[evt.type].forEach(function (fn) {
                    return fn.call(_this, evt);
                });
            }
        }, {
            key: 'removeEventListener',
            value: function removeEventListener(evtName, handler) {
                var listeners = this.eventListeners[evtName];

                if (!listeners) return;

                var idx = listeners.indexOf(handler);

                this.eventListeners[evtName] = listeners.slice(0, idx).concat(listeners.slice(idx, listeners.length));
            }
        }, {
            key: 'equal',
            value: function equal(node) {
                return this.elt && node.elt && this.elt == node.elt && this.text == node.text && deepEqual(this.attributes, node.attributes) && this.children.every(function (child, index) {
                    return child.equal(node.children[index]);
                });
            }
        }, {
            key: 'applyChanges',
            value: function applyChanges(elt2) {
                var _this2 = this;

                if (!this.elt) {
                    this.materialize();
                }

                var _ref = [elt2.children, elt2.attributes, elt2.innerText],
                    children = _ref[0],
                    attributes = _ref[1],
                    text = _ref[2];


                children.forEach(function (newChild, index) {
                    if (index >= _this2.children.length) {
                        _this2.children.push(newChild);
                    } else if (_this2.children[index].equal(newChild)) {
                        return;
                    }

                    _this2.children[index].applyChanges(newChild);
                });

                if (attributes && !deepEqual(this.attributes, attributes)) {
                    Object.keys(attributes).forEach(function (key) {
                        var value = attributes[key];

                        if (_this2.attributes[key] == value) return;

                        _this2.attributes[key] = value;
                        _this2.elt.setAttribute(key, value);
                    });

                    Object.keys(this.attributes).forEach(function (key) {
                        if (typeof attributes[key] === 'undefined') {
                            delete _this2.attributes[key];
                            _this2.elt.removeAttribute(key);
                        }
                    });
                }

                if (text && text != this.innerText) {
                    this.innerText = text;
                    this.elt.innerText = text;
                }
            }
        }, {
            key: 'materialize',
            value: function materialize(placeholder) {
                var _this3 = this;

                this.elt = document.createElement(this.tagName);

                if (typeof this.innerText !== 'undefined' && this.innerText !== null) this.elt.innerText = this.innerText;

                Object.keys(this.attributes).forEach(function (key) {
                    return _this3.elt.setAttribute(key, _this3.attributes[key]);
                });

                Object.keys(this.eventListeners).forEach(function (evtName) {
                    _this3.eventListeners[evtName].forEach(function (listener) {
                        return _this3.elt.addEventListener(evtName, listener.bind(_this3.elt));
                    });
                });

                setImmediate(function (_) {
                    _this3.children.forEach(function (child) {
                        return child.materialize(_this3.elt);
                    });
                });

                if (this.parent && this.parent.elt) {
                    this.parent.elt.appendChild(this.elt);
                } else if (placeholder) {
                    placeholder.appendChild(this.elt);
                }
            }
        }]);

        return VirtualDOMNode;
    }();

    var C = function () {
        function C(tagName, _arg1, _arg2) {
            _classCallCheck(this, C);

            var children = void 0,
                attrs = void 0,
                elt = void 0;

            if (isArray(_arg1)) {
                children = _arg1.slice();
            } else if (isObject(_arg1)) {
                attrs = _arg1;

                if (isArray(_arg2)) children = _arg2.slice();else children = [_arg2];
            } else {
                children = [_arg1];
            }

            children = children ? flatten(children) : [];
            attrs = attrs || {};

            elt = new VirtualDOMNode(tagName);

            Object.keys(attrs).forEach(function (attrName) {
                var attrValue = attrs[attrName];

                if (isFunction(attrValue)) {
                    elt.addEventListener(attrName, attrValue);
                } else {
                    elt.setAttribute(attrName, attrValue);
                }
            });

            children.forEach(function (child) {
                if (typeof child === 'undefined' || child == null) return;

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

        _createClass(C, [{
            key: 'mount',
            value: function mount(placeholder) {
                this.elt.materialize(placeholder);
            }
        }, {
            key: 'unmount',
            value: function unmount() {
                this.elt.parentElement.removeChild(this.elt);
            }
        }, {
            key: 'on',
            value: function on(evt, cb, sink) {
                this.elt.addEventListener(evt, cb.bind(this), sink);
            }
        }, {
            key: 'fire',
            value: function fire(evtName) {
                var evt = new Event(evtName, [].slice.apply(arguments, 1));
                this.elt.dispatchEvent(evt);
            }
        }]);

        return C;
    }();

    var c = function c(tagName, _arg1, _arg2) {
        return new C(tagName, _arg1, _arg2);
    };

    var Store = function () {
        function Store(initialState) {
            _classCallCheck(this, Store);

            this.state = deepCopy(initialState);
            this.listener = function () {
                return null;
            };
            this.reducer = function (state, _) {
                return state;
            };
        }

        _createClass(Store, [{
            key: 'getState',
            value: function getState() {
                return deepCopy(this.state);
            }
        }, {
            key: 'onAction',
            value: function onAction(fn) {
                this.reducer = fn;
            }
        }, {
            key: 'onStateChanged',
            value: function onStateChanged(fn) {
                this.listener = fn;
            }
        }, {
            key: 'dispatch',
            value: function dispatch(action) {
                var _this4 = this;

                setImmediate(function (_) {
                    var oldState = deepCopy(_this4.state);
                    var newState = _this4.reducer(_this4.state, action);

                    if (deepEqual(newState, oldState)) return;

                    _this4.state = newState;
                    _this4.listener(newState, oldState);
                });
            }
        }], [{
            key: 'createStore',
            value: function createStore(initialState) {
                return new Store(initialState);
            }
        }]);

        return Store;
    }();

    var Application = function () {
        function Application(initialState, updateFn, viewFn) {
            _classCallCheck(this, Application);

            this.store = new Store(initialState);

            this.updateFn = updateFn;
            this.viewFn = viewFn;

            this.view = null;

            this.store.onAction(this._onAction.bind(this));
            this.store.onStateChanged(this._onStateChanged.bind(this));
        }

        _createClass(Application, [{
            key: 'mount',
            value: function mount(placeholder) {
                this.view = this.viewFn.call(null, this.store.getState(), this.dispatch.bind(this));
                this.view.elt.materialize(placeholder);
            }
        }, {
            key: 'dispatch',
            value: function dispatch(message) {
                this.store.dispatch(message);
            }
        }, {
            key: '_onAction',
            value: function _onAction(state, message) {
                return this.updateFn.call(null, state, message);
            }
        }, {
            key: '_onStateChanged',
            value: function _onStateChanged(state) {
                var newView = this.viewFn.call(null, state, this.dispatch.bind(this));
                this.view.elt.applyChanges(newView.elt);
            }
        }]);

        return Application;
    }();

    var createApplication = function createApplication(initialState, updateFn, viewFn) {
        return new Application(initialState, updateFn, viewFn);
    };

    if (typeof window !== 'undefined') {
        window.c = c;
        window.createApplication = createApplication;
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module != null && module.exports) {
        module.exports = {
            c: c,
            createApplication: createApplication
        };
    }
})();