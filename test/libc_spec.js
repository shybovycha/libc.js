import * as utils from '../src/utils.js';
import * as vdom from '../src/vdom.js';
import { Store } from '../src/store.js';

// do not run functions in the EventLoop in tests
utils.setImmediate = (fn) => fn();

describe('libc', () => {
    describe('utilities', () => {
        describe('type checks', () => {
            describe('isObject', () => {
                describe('for objects', () => {
                    it('returns true', () => {
                        expect(utils.isObject({ moo: 'foo' })).toBe(true);
                    });
                });

                describe('for arrays', () => {
                    it('returns false', () => {
                        expect(utils.isObject([ 1, 2, 3 ])).toBe(false);
                    });
                });

                describe('for functions', () => {
                    it('returns false', () => {
                        expect(utils.isObject(() => -1)).toBe(false);
                    });
                });

                describe('for VirtualDOM nodes', () => {
                    it('returns false', () => {
                        expect(utils.isObject(new vdom.VirtualDOMNode('div'))).toBe(true);
                    });
                });
            });

            describe('isFunction', () => {
                describe('for objects', () => {
                    it('returns false', () => {
                        expect(utils.isFunction({ moo: 'foo' })).toBe(false);
                    });
                });

                describe('for arrays', () => {
                    it('returns false', () => {
                        expect(utils.isFunction([ 1, 2, 3 ])).toBe(false);
                    });
                });

                describe('for functions', () => {
                    it('returns true', () => {
                        expect(utils.isFunction(() => -1)).toBe(true);
                    });
                });

                describe('for VirtualDOM nodes', () => {
                    it('returns false', () => {
                        expect(utils.isFunction(new vdom.VirtualDOMNode('div'))).toBe(false);
                    });
                });
            });

            describe('isArray', () => {
                describe('for objects', () => {
                    it('returns false', () => {
                        expect(utils.isArray({ moo: 'foo' })).toBe(false);
                    });
                });

                describe('for arrays', () => {
                    it('returns true', () => {
                        expect(utils.isArray([ 1, 2, 3 ])).toBe(true);
                    });
                });

                describe('for functions', () => {
                    it('returns false', () => {
                        expect(utils.isArray(() => -1)).toBe(false);
                    });
                });

                describe('for VirtualDOM nodes', () => {
                    it('returns false', () => {
                        expect(utils.isArray(new vdom.VirtualDOMNode('div'))).toBe(false);
                    });
                });
            });

            describe('isDOM', () => {
                describe('for objects', () => {
                    it('returns false', () => {
                        expect(vdom.isDOM({ moo: 'foo' })).toBe(false);
                    });
                });

                describe('for arrays', () => {
                    it('returns false', () => {
                        expect(vdom.isDOM([ 1, 2, 3 ])).toBe(false);
                    });
                });

                describe('for functions', () => {
                    it('returns false', () => {
                        expect(vdom.isDOM(() => -1)).toBe(false);
                    });
                });

                describe('for VirtualDOM nodes', () => {
                    it('returns true', () => {
                        expect(vdom.isDOM(new vdom.VirtualDOMNode('div'))).toBe(true);
                    });
                });
            });
        });

        describe('object manipulation', () => {
            describe('deepEqual', () => {
                describe('for two null objects', () => {
                    it('returns true', () => {
                        expect(utils.deepEqual(null, null)).toBe(true);
                    });
                });

                describe('for one null and one non-null value', () => {
                    it('returns false', () => {
                        expect(utils.deepEqual(null, { moo: 'foo' })).toBe(false);
                    });
                });

                describe('for same values', () => {
                    it('returns true', () => {
                        let obj = { moo: 'foo' };

                        expect(utils.deepEqual(obj, obj)).toBe(true);
                    });
                });

                describe('for two empty arrays', () => {
                    it('returns true', () => {
                        expect(utils.deepEqual([], [])).toBe(true);
                    });
                });

                describe('for one empty and one non-empty array', () => {
                    it('returns false', () => {
                        expect(utils.deepEqual([], [ 1, 2, 3 ])).toBe(false);
                    });
                });

                describe('for two equal arrays', () => {
                    it('returns true', () => {
                        expect(utils.deepEqual([ 1, 2, 3 ], [ 1, 2, 3 ])).toBe(true);
                    });
                });

                describe('for two arrays with same content but different order', () => {
                    it('returns false', () => {
                        expect(utils.deepEqual([ 1, 2, 3 ], [ 3, 1, 2 ])).toBe(false);
                    });
                });

                describe('for two empty objects', () => {
                    it('returns true', () => {
                        expect(utils.deepEqual({}, {})).toBe(true);
                    });
                });

                describe('for one empty and one non-empty object', () => {
                    it('returns false', () => {
                        expect(utils.deepEqual({}, { moo: 'foo' })).toBe(false);
                    });
                });

                describe('for deeply inequal objects', () => {
                    it('returns false', () => {
                        let obj1 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v4' } ] } };
                        let obj2 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v5' } ] } };

                        expect(utils.deepEqual(obj1, obj2)).toBe(false);
                    });
                });

                describe('for deeply equal objects', () => {
                    it('returns true', () => {
                        let obj1 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v4' } ] } };
                        let obj2 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v4' } ] } };

                        expect(utils.deepEqual(obj1, obj2)).toBe(true);
                    });
                });
            });

            describe('deepCopy', () => {
                describe('for array', () => {
                    it('creates a copy', () => {
                        let a = [];
                        let b = utils.deepCopy(a);

                        a.push(1);

                        expect(a).toEqual([ 1 ]);
                        expect(b).toEqual([]);
                    });
                });

                describe('for object', () => {
                    it('creates a copy', () => {
                        let a = { name: 'moo' };
                        let b = utils.deepCopy(a);

                        a['name'] = 'bar';

                        expect(a['name']).toEqual('bar');
                        expect(b['name']).toEqual('moo');
                    });
                });
            });
        });

        describe('list manipulation', () => {
            describe('flatten', () => {
                describe('for empty array', () => {
                    it('returns empty array', () => {
                        expect(utils.flatten([])).toEqual([]);
                    });
                });

                describe('for non-empty one-dimensional array', () => {
                    it('returns one-dimensional array', () => {
                        expect(utils.flatten([ 1, 2, 3 ])).toEqual([ 1, 2, 3 ]);
                    });
                });

                describe('for non-empty complex nested array', () => {
                    it('returns one-dimensional array', () => {
                        expect(utils.flatten([ 1, [ 2, 3, [4], [ [5], [6] ] ] ])).toEqual([1, 2, 3, 4, 5, 6]);
                    });
                });
            });
        });
    });

    describe('state management', () => {
        describe('createStore()', () => {
            it('creates a new store', () => {
                expect(Store.createStore()).toBeInstanceOf(Store);
            });

            it('sets initial state', () => {
                expect(Store.createStore({ name: 'moo' }).getState()).toEqual({ name: 'moo' });
            });
        });

        describe('initial state', () => {
            it('is immutable', () => {
                let initialState = { value: 'moo' };
                const store = new Store(initialState);

                initialState.value = 'foo';

                expect(store.getState()).toEqual({ value: 'moo' });
            });
        });

        describe('dispatching', () => {
            let initialState = {
                value: 'moo'
            };

            let store;
            let reducer;
            let handler;

            beforeEach(() => {
                reducer = jest.fn((state, message) => {
                    if (message.type == 'KNOWN_MSG') {
                        return Object.assign({}, state, {
                            value: message.value
                        });
                    }

                    return state;
                });

                handler = jest.fn();

                store = new Store(initialState);
                store.onAction(reducer);
                store.onStateChanged(handler);
            });

            describe('known message', () => {
                const changeMessage = {
                    type: 'KNOWN_MSG',
                    value: 'foo'
                };

                const noChangeMessage = {
                    type: 'KNOWN_MSG',
                    value: 'moo'
                };

                describe('always', () => {
                    // it('does not mutate state directly', () => {
                    //     expect(() => store.dispatch(changeMessage)).not.to.change(store.getState(), 'value');
                    // });

                    it('invokes reducer', () => {
                        store.dispatch(changeMessage);

                        expect(reducer).toBeCalled();
                    });
                });

                describe('which does not change state', () => {
                    beforeEach(() => {
                        store.dispatch(noChangeMessage);
                    });

                    it('does not invoke handler', () => {
                        expect(handler).not.toBeCalled();
                    });
                });

                describe('which changes state', () => {
                    beforeEach(function () {
                        store.dispatch(changeMessage);
                    });

                    it('invokes handler', () => {
                        expect(handler).toBeCalledWith({ value: 'foo' }, { value: 'moo' });
                    });
                });
            });

            describe('unknown message', () => {
                const message = {
                    type: 'UNKNOWN',
                    value: 'bar'
                };

                // it('does not affect state', () => {
                //     expect(() => store.dispatch(message)).not.to.change(store.getState(), 'value');
                // });

                it('does not invoke handler', () => {
                    store.dispatch(message)

                    expect(handler).not.toBeCalled();
                });
            });
        });
    });

    // describe('virtual DOM', () => {
    //     describe('constructing tree with', () => {
    //         describe('empty node', () => {
    //             xit('creates virtual DOM node', () => {});
    //         });

    //         describe('node with text attributes only', () => {
    //             xit('creates virtual DOM node', () => {});
    //         });

    //         describe('node with event listeners only', () => {
    //             xit('creates virtual DOM node', () => {});
    //         });

    //         describe('node with text only', () => {
    //             xit('creates virtual DOM node', () => {});
    //         });

    //         describe('node with children only', () => {
    //             xit('creates virtual DOM node tree', () => {});
    //         });

    //         describe('node with mixed parameters', () => {
    //             xit('creates virtual DOM node tree', () => {});
    //         });
    //     });

    //     describe('comparing', () => {
    //         describe('two empty trees', () => {
    //             xit('returns true', () => {});
    //         });

    //         describe('one empty and one non-empty trees', () => {
    //             xit('returns false', () => {});
    //         });

    //         describe('equal trees', () => {
    //             xit('returns true', () => {});
    //         });

    //         describe('non-equal trees', () => {
    //             xit('returns false', () => {});
    //         });
    //     });

    //     describe('updating', () => {
    //         describe('empty tree', () => {
    //             describe('to empty tree', () => {
    //                 xit('does nothing', () => {});
    //             });

    //             describe('to non-empty tree', () => {
    //                 xit('updates DOM tree', () => {});
    //             });
    //         });

    //         describe('non-empty tree', () => {
    //             describe('to update attributes', () => {
    //                 xit('updates DOM', () => {});
    //             });

    //             describe('to update text', () => {
    //                 xit('updates DOM', () => {});
    //             });

    //             describe('to remove children', () => {
    //                 xit('updates DOM', () => {});
    //             });

    //             describe('to add children', () => {
    //                 xit('updates DOM', () => {});
    //             });

    //             describe('to update children', () => {
    //                 xit('updates DOM', () => {});
    //             });
    //         });
    //     });
    // });

    // describe('application', () => {
    //     describe('when mount', () => {
    //         xit('invokes view function', () => {});

    //         xit('does not invoke update function', () => {});

    //         xit('creates DOM structure', () => {});
    //     });

    //     describe('dispatching', () => {
    //         describe('always', () => {
    //             xit('invokes update function', () => {});
    //         });

    //         describe('known message', () => {
    //             describe('which changes state', () => {
    //                 xit('invokes view function', () => {});
    //             });

    //             describe('which does not change state', () => {
    //                 xit('does not invoke view function', () => {});
    //             });
    //         });

    //         describe('unknown message', () => {
    //             xit('does not invoke view function', () => {});
    //         });
    //     });
    // });
});
