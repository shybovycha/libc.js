'use strict';

export let getType = val => Object.prototype.toString.call(val);

export let isObject = val => val !== null && getType(val) === '[object Object]';

export let isArray = val => getType(val) === '[object Array]';

export let isString = val => getType(val) === '[object String]';

export let isFunction = val => getType(val) === '[object Function]';

export let flatten = arr => arr.reduce((acc, e) => acc.concat(isArray(e) ? flatten(e) : [e]), []);

export let setImmediate = fn => fn(); // setTimeout(fn, 0);

export let deepCopy = (val) => {
    if (isArray(val))
        return [].slice.call(val);

    if (!isObject(val))
        return val;

    let ret = {};

    Object.keys(val).forEach(k => ret[k] = deepCopy(val[k]));

    return ret;
};

export let deepEqual = (obj1, obj2) => {
    if ((obj1 === null && obj2 !== null) || (obj1 === null && obj2 !== null))
        return false;

    if (obj1 === null && obj2 === null)
        return true;

    if ((!isObject(obj1) && isObject(obj2)) || (isObject(obj1) && !isObject(obj2)))
        return false;

    if (!isObject(obj1) && !isObject(obj2) && !isArray(obj1) && !isArray(obj2))
        return obj1 == obj2;

    let keys1 = Object.keys(obj1);

    for (let key of keys1) {
        if (!obj2.hasOwnProperty(key))
            return false;

        if (!deepEqual(obj1[key], obj2[key]))
            return false;
    }

    let keys2 = Object.keys(obj2);

    for (let key of keys2) {
        if (!obj1.hasOwnProperty(key))
            return false;

        if (!deepEqual(obj1[key], obj2[key]))
            return false;
    }

    return true;
};
