;(function () {
  'use strict';

  // let getType = val => Object.prototype.toString.call(val);

  // let isObject = val => val !== null && getType(val) === '[object Object]';

  // let isArray = val => getType(val) === '[object Array]';

  var typeOf = function (v) {
    return Object.prototype.toString.call(v);
  };

  var isString = function (v) {
    return (typeOf(v) === '[object String]');
  };

  var isArray = function (v) {
    return (typeOf(v) === '[object Array]');
  };

  var isObject = function (v) {
    return (v !== null && typeOf(v) === '[object Object]')
  };

  var isFunction = function (v) {
    return (typeOf(v) === '[object Function]');
  };

  var isDOM = function (v) {
    return (v.nodeType && v.nodeType > 0);
  };

  var flatten = function (arr) {
    return arr.reduce(function (acc, e) { return acc.concat(isArray(e) ? flatten(e) : [e]); }, []);
  };

  function C(tagName, _arg1, _arg2) {
    var children, attrs, elt;

    if (isArray(_arg1)) {
      children = _arg1.slice();
    } else if (isObject(_arg1)) {
      attrs = _arg1;

      if (isArray(_arg2))
        children = _arg2.slice();
      else
        children = [_arg2];
    } else {
      children = [_arg1];
    }

    children = children ? flatten(children) : [];
    attrs = attrs || {};

    elt = document.createElement(tagName);

    Object.keys(attrs).forEach(function (attrName) {
      var attrValue = attrs[attrName];

      if (isFunction(attrValue)) {
        // TODO: validate event "${attrName}"
        elt.addEventListener(attrName, attrValue);
      } else {
        elt.setAttribute(attrName, attrValue);
      }
    });

    children.forEach(function (child) {
      if (typeof(child) === 'undefined' || child == null)
        return;

      if (isDOM(child)) {
        elt.appendChild(child);
      } else if (child instanceof C) {
        elt.appendChild(child.elt);
      } else {
        elt.innerHTML = child;
      }
    });

    this.elt = elt;
    // this.children = children;
    // this.attrs = attrs;
  };

  C.prototype.mount = function (elt) {
    elt.appendChild(this.elt);
    // this.parent = elt;
  };

  C.prototype.unmount = function () {
    this.elt.parentElement.removeChild(this.elt);
  };

  C.prototype.on = function (evt, cb, sink) {
    this.elt.addEventListener(evt, cb.bind(this), sink);
  };

  C.prototype.fire = function (evtName) {
    var evt = new Event(evtName, [].slice.apply(arguments, 1));
    this.elt.dispatchEvent(evt);
  };

  function c(tagName, _arg1, _arg2) {
    return new C(tagName, _arg1, _arg2);
  }

  if (typeof window !== "undefined") {
    window.c = c;
  } else if (typeof module === "object" && module != null && module.exports) {
    module.exports = c;
  } else if (typeof define === "function" && define.amd) {
    define(function () { return c; })
  } else {
    return c;
  }
})();