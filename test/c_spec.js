var chai = require('chai');

chai.use(require('chai-spies'));

var expect = chai.expect;

var utils = require('../src/utils.js');
var vdom = require('../src/vdom.js');
var Store = require('../src/store.js').Store;

// do not run functions in the EventLoop in tests
utils.setImmediate = function (fn) { fn(); };

describe('libc', function () {
    describe('utilities', function () {
        describe('type checks', function () {
            describe('isObject', function () {
                describe('for objects', function () {
                    it('returns true', function () {
                        expect(utils.isObject({ moo: 'foo' })).to.be.true;
                    });
                });

                describe('for arrays', function () {
                    it('returns false', function () {
                        expect(utils.isObject([ 1, 2, 3 ])).to.be.false;
                    });
                });

                describe('for functions', function () {
                    it('returns false', function () {
                        expect(utils.isObject(function () { return -1; })).to.be.false;
                    });
                });

                describe('for VirtualDOM nodes', function () {
                    it('returns false', function () {
                        expect(utils.isObject(new vdom.VirtualDOMNode('div'))).to.be.true;
                    });
                });
            });

            describe('isFunction', function () {
                describe('for objects', function () {
                    it('returns false', function () {
                        expect(utils.isFunction({ moo: 'foo' })).to.be.false;
                    });
                });

                describe('for arrays', function () {
                    it('returns false', function () {
                        expect(utils.isFunction([ 1, 2, 3 ])).to.be.false;
                    });
                });

                describe('for functions', function () {
                    it('returns true', function () {
                        expect(utils.isFunction(function () { return -1; })).to.be.true;
                    });
                });

                describe('for VirtualDOM nodes', function () {
                    it('returns false', function () {
                        expect(utils.isFunction(new vdom.VirtualDOMNode('div'))).to.be.false;
                    });
                });
            });

            describe('isArray', function () {
                describe('for objects', function () {
                    it('returns false', function () {
                        expect(utils.isArray({ moo: 'foo' })).to.be.false;
                    });
                });

                describe('for arrays', function () {
                    it('returns true', function () {
                        expect(utils.isArray([ 1, 2, 3 ])).to.be.true;
                    });
                });

                describe('for functions', function () {
                    it('returns false', function () {
                        expect(utils.isArray(function () { return -1; })).to.be.false;
                    });
                });

                describe('for VirtualDOM nodes', function () {
                    it('returns false', function () {
                        expect(utils.isArray(new vdom.VirtualDOMNode('div'))).to.be.false;
                    });
                });
            });

            describe('isDOM', function () {
                describe('for objects', function () {
                    it('returns false', function () {
                        expect(vdom.isDOM({ moo: 'foo' })).to.be.false;
                    });
                });

                describe('for arrays', function () {
                    it('returns false', function () {
                        expect(vdom.isDOM([ 1, 2, 3 ])).to.be.false;
                    });
                });

                describe('for functions', function () {
                    it('returns false', function () {
                        expect(vdom.isDOM(function () { return -1; })).to.be.false;
                    });
                });

                describe('for VirtualDOM nodes', function () {
                    it('returns true', function () {
                        expect(vdom.isDOM(new vdom.VirtualDOMNode('div'))).to.be.true;
                    });
                });
            });
        });

        describe('object manipulation', function () {
            describe('deepEqual', function () {
                describe('for two null objects', function () {
                    it('returns true', function () {
                        expect(utils.deepEqual(null, null)).to.be.true;
                    });
                });

                describe('for one null and one non-null value', function () {
                    it('returns false', function () {
                        expect(utils.deepEqual(null, { moo: 'foo' })).to.be.false;
                    });
                });

                describe('for same values', function () {
                    it('returns true', function () {
                        var obj = { moo: 'foo' };

                        expect(utils.deepEqual(obj, obj)).to.be.true;
                    });
                });

                describe('for two empty arrays', function () {
                    it('returns true', function () {
                        expect(utils.deepEqual([], [])).to.be.true;
                    });
                });

                describe('for one empty and one non-empty array', function () {
                    it('returns false', function () {
                        expect(utils.deepEqual([], [ 1, 2, 3 ])).to.be.false;
                    });
                });

                describe('for two equal arrays', function () {
                    it('returns true', function () {
                        expect(utils.deepEqual([ 1, 2, 3 ], [ 1, 2, 3 ])).to.be.true;
                    });
                });

                describe('for two arrays with same content but different order', function () {
                    it('returns false', function () {
                        expect(utils.deepEqual([ 1, 2, 3 ], [ 3, 1, 2 ])).to.be.false;
                    });
                });

                describe('for two empty objects', function () {
                    it('returns true', function () {
                        expect(utils.deepEqual({}, {})).to.be.true;
                    });
                });

                describe('for one empty and one non-empty object', function () {
                    it('returns false', function () {
                        expect(utils.deepEqual({}, { moo: 'foo' })).to.be.false;
                    });
                });

                describe('for deeply inequal objects', function () {
                    it('returns false', function () {
                        var obj1 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v4' } ] } };
                        var obj2 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v5' } ] } };

                        expect(utils.deepEqual(obj1, obj2)).to.be.false;
                    });
                });

                describe('for deeply equal objects', function () {
                    it('returns true', function () {
                        var obj1 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v4' } ] } };
                        var obj2 = { k1: { k2: [ { k3: 'v3' }, { k4: 'v4' } ] } };

                        expect(utils.deepEqual(obj1, obj2)).to.be.true;
                    });
                });
            });

            describe('deepCopy', function () {
                describe('for array', function () {
                    it('creates a copy', function () {
                        var a = [];
                        var b = utils.deepCopy(a);

                        a.push(1);

                        expect(a).to.eql([ 1 ]);
                        expect(b).to.eql([]);
                    });
                });

                describe('for object', function () {
                    it('creates a copy', function () {
                        var a = { name: 'moo' };
                        var b = utils.deepCopy(a);

                        a['name'] = 'bar';

                        expect(a['name']).to.eql('bar');
                        expect(b['name']).to.eql('moo');
                    });
                });
            });
        });

        describe('list manipulation', function () {
            describe('flatten', function () {
                describe('for empty array', function () {
                    it('returns empty array', function () {
                        expect(utils.flatten([])).to.eql([]);
                    });
                });

                describe('for non-empty one-dimensional array', function () {
                    it('returns one-dimensional array', function () {
                        expect(utils.flatten([ 1, 2, 3 ])).to.eql([ 1, 2, 3 ]);
                    });
                });

                describe('for non-empty complex nested array', function () {
                    it('returns one-dimensional array', function () {
                        expect(utils.flatten([ 1, [ 2, 3, [ 4 ], [ [ 5 ], [ 6 ] ] ] ])).to.eql([ 1, 2, 3, 4, 5, 6 ]);
                    });
                });
            });
        });
    });

    describe('state management', function () {
        describe('initial state', function () {
            it('is immutable', function () {
                var initialState = { value: 'moo' };
                var store = new Store(initialState);

                initialState.value = 'foo';

                expect(store.getState()).to.eql({ value: 'moo' });
            });
        });

        describe('dispatching', function () {
            beforeEach(function () {
                this.initialState = { value: 'moo' };

                this.reducer = chai.spy(function (state, message) {
                    if (message.type == 'KNOWN_MSG') {
                        return Object.assign({}, state, { value: message.value });
                    }

                    return state;
                });

                this.handler = chai.spy();

                this.store = new Store(this.initialState);
                this.store.onAction(this.reducer);
                this.store.onStateChanged(this.handler);
            });

            describe('known message', function() {
                beforeEach(function () {
                    this.changeMessage = { type: 'KNOWN_MSG', value: 'foo' };
                    this.noChangeMessage = { type: 'KNOWN_MSG', value: 'moo' };
                });

                describe('always', function () {
                    it('does not mutate state directly', function () {
                        expect(() => this.store.dispatch(this.changeMessage)).not.to.change(this.store.getState(), 'value');
                    });

                    it('invokes reducer', function () {
                        this.store.dispatch(this.changeMessage);

                        expect(this.reducer).to.have.been.called();
                    });
                });

                describe('which does not change state', function () {
                    beforeEach(function () {
                        this.store.dispatch(this.noChangeMessage);
                    });

                    it('does not invoke handler', function () {
                        expect(this.handler).not.to.have.been.called();
                    });
                });

                describe('which changes state', function () {
                    beforeEach(function () {
                        this.store.dispatch(this.changeMessage);
                    });

                    it('invokes handler', function () {
                        expect(this.handler).to.have.been.called.with({ value: 'moo' }, { value: 'foo' });
                    });
                });
            });

            describe('unknown message', function () {
                beforeEach(function () {
                    this.message = { type: 'UNKNOWN', value: 'bar' };
                });

                it('does not affect state', function () {
                    expect(() => this.store.dispatch(this.message)).not.to.change(this.store.getState(), 'value');
                });

                it('does not invoke handler', function () {
                    this.store.dispatch(this.message)

                    expect(this.handler).not.to.have.been.called();
                });
            });
        });
    });

    describe('virtual DOM', function () {
        describe('constructing tree with', function () {
            describe('empty node', function () {
                xit('creates virtual DOM node', function () {});
            });

            describe('node with text attributes only', function () {
                xit('creates virtual DOM node', function () {});
            });

            describe('node with event listeners only', function () {
                xit('creates virtual DOM node', function () {});
            });

            describe('node with text only', function () {
                xit('creates virtual DOM node', function () {});
            });

            describe('node with children only', function () {
                xit('creates virtual DOM node tree', function () {});
            });

            describe('node with mixed parameters', function () {
                xit('creates virtual DOM node tree', function () {});
            });
        });

        describe('comparing', function () {
            describe('two empty trees', function () {
                xit('returns true', function () {});
            });

            describe('one empty and one non-empty trees', function () {
                xit('returns false', function () {});
            });

            describe('equal trees', function () {
                xit('returns true', function () {});
            });

            describe('non-equal trees', function () {
                xit('returns false', function () {});
            });
        });

        describe('updating', function () {
            describe('empty tree', function () {
                describe('to empty tree', function () {
                    xit('does nothing', function () {});
                });

                describe('to non-empty tree', function () {
                    xit('updates DOM tree', function () {});
                });
            });

            describe('non-empty tree', function () {
                describe('to update attributes', function () {
                    xit('updates DOM', function () {});
                });

                describe('to update text', function () {
                    xit('updates DOM', function () {});
                });

                describe('to remove children', function () {
                    xit('updates DOM', function () {});
                });

                describe('to add children', function () {
                    xit('updates DOM', function () {});
                });

                describe('to update children', function () {
                    xit('updates DOM', function () {});
                });
            });
        });
    });

    describe('application', function () {
        describe('when mount', function () {
            xit('invokes view function', function () {});

            xit('does not invoke update function', function () {});

            xit('creates DOM structure', function () {});
        });

        describe('dispatching', function () {
            describe('always', function () {
                xit('invokes update function', function () {});
            });

            describe('known message', function () {
                describe('which changes state', function () {
                    xit('invokes view function', function () {});
                });

                describe('which does not change state', function () {
                    xit('does not invoke view function', function () {});
                });
            });

            describe('unknown message', function () {
                xit('does not invoke view function', function () {});
            });
        });
    });
});
