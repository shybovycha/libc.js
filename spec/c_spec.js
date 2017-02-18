describe('libc', function () {
    describe('utilities', function () {
        describe('type checks', function () {
            describe('isObject', function () {
                describe('for objects', function () {
                    xit('returns true', function () {});
                });

                describe('for arrays', function () {
                    xit('returns false', function () {});
                });

                describe('for functions', function () {
                    xit('returns false', function () {});
                });

                describe('for DOM nodes', function () {
                    xit('returns false', function () {});
                });
            });

            describe('isFunction', function () {
                describe('for objects', function () {
                    xit('returns false', function () {});
                });

                describe('for arrays', function () {
                    xit('returns false', function () {});
                });

                describe('for functions', function () {
                    xit('returns true', function () {});
                });

                describe('for DOM nodes', function () {
                    xit('returns false', function () {});
                });
            });

            describe('isArray', function () {
                describe('for objects', function () {
                    xit('returns false', function () {});
                });

                describe('for arrays', function () {
                    xit('returns true', function () {});
                });

                describe('for functions', function () {
                    xit('returns false', function () {});
                });

                describe('for DOM nodes', function () {
                    xit('returns false', function () {});
                });
            });

            describe('isDOM', function () {
                describe('for objects', function () {
                    xit('returns false', function () {});
                });

                describe('for arrays', function () {
                    xit('returns false', function () {});
                });

                describe('for functions', function () {
                    xit('returns false', function () {});
                });

                describe('for DOM nodes', function () {
                    xit('returns true', function () {});
                });
            });
        });

        describe('object manipulation', function () {
            describe('deepEqual', function () {
                describe('for two null objects', function () {
                    xit('returns true', function () {});
                });

                describe('for one null and one non-null value', function () {
                    xit('returns false', function () {});
                });

                describe('for same values', function () {
                    xit('returns true', function () {});
                });

                describe('for two empty arrays', function () {
                    xit('returns true', function () {});
                });

                describe('for one empty and one non-empty array', function () {
                    xit('returns false', function () {});
                });

                describe('for two equal arrays', function () {
                    xit('returns true', function () {});
                });

                describe('for two empty objects', function () {
                    xit('returns true', function () {});
                });

                describe('for one empty and one non-empty object', function () {
                    xit('returns false', function () {});
                });

                describe('for deeply inequal objects', function () {
                    xit('returns false', function () {});
                });

                describe('for deeply equal objects', function () {
                    xit('returns true', function () {});
                });
            });

            describe('deepCopy', function () {
                describe('for array', function () {
                    xit('creates a copy', function () {});
                });

                describe('for number', function () {
                    xit('returns its value', function () {});
                });

                describe('for boolean', function () {
                    xit('returns its value', function () {});
                });

                describe('for string', function () {
                    xit('returns its value', function () {});
                });

                describe('for function', function () {
                    xit('returns its value', function () {});
                });

                describe('for null', function () {
                    xit('returns its value', function () {});
                });

                describe('for object', function () {
                    xit('creates a copy', function () {});
                });
            });
        });

        describe('list manipulation', function () {
            describe('flatten', function () {
                describe('for empty array', function () {
                    xit('returns empty array', function () {});
                });

                describe('for non-empty one-dimensional array', function () {
                    xit('returns one-dimensional array', function () {});
                });

                describe('for non-empty complex nested array', function () {
                    xit('returns one-dimensional array', function () {});
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

    describe('state management', function () {
        describe('initial state', function () {
            xit('is immutable', function () {});
        });

        describe('dispatching', function () {
            describe('known message', function() {
                describe('always', function () {
                    xit('does not mutate state directly', function () {});

                    xit('invokes reducer', function () {});
                });

                describe('which does not change state', function () {
                    xit('does not invoke handlers', function () {});
                });

                describe('which changes state', function () {
                    xit('invokes handlers', function () {});
                });
            });

            describe('unknown message', function () {
                xit('does not affect state', function () {});

                xit('does not invoke handlers', function () {});
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
