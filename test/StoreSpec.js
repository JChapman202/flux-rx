import Chance from 'chance';
import Store from '../src/Store';
import Dispatcher from '../src/Dispatcher';
import {expect} from 'chai';
import Immutable from 'immutable';
import sinon from 'sinon';

var chance = new Chance();

class MessageA extends Immutable.Record({
	message: null
}) {
	constructor(message) {
		super({message});
	}
}

class MessageB extends Immutable.Record({
	message: null
}) {
	constructor(message) {
		super({message});
	}
}

describe('Store', () => {
	var dispatcher;
	beforeEach(() => {
		dispatcher = new Dispatcher();
	});

	describe('When constructing a store instance with an initial state', () => {
		var state;
		var store;
		beforeEach(() => {
			state = {test: chance.string()};
			store = new Store(dispatcher, state);
		});

		it('Should have a state which equals provided initial state', () => {
			expect(store._state.get('test')).to.equal(state.test);
		});
	});

	describe('When constructing a store instance without an initial state', () => {
		var store;

		beforeEach(() => {
			store = new Store(dispatcher);
		});

		it('should constrct the store successfully', () => {
			expect(store).to.not.be.null;
		});

		describe('When registering a store handler', () => {
			var otherStore;
			var handlerSpy;

			beforeEach(() => {
				otherStore = new Store(dispatcher);
				otherStore.registerMessage(MessageA, () => {return {called: true};});

				handlerSpy = sinon.spy((storeInstance) => {return {calledOther: storeInstance._state.get('called')};});
				store.registerStore(otherStore, handlerSpy);
			});

			describe('When the other store is updated', () => {
				beforeEach(() => {
					dispatcher.dispatch(new MessageA(chance.string()));
				});

				it('Should call the handler for this store', () => {
					sinon.assert.calledWith(handlerSpy, otherStore);
				});

				it('Should update the state of the store', () => {
					expect(store._state.get('calledOther')).to.be.true;
				});
			});
		});

		describe('When registering a message handler on the store with a filter', () => {
			var handlerSpy;
			var filterSpy;
			var filter;

			beforeEach(() => {
				filter = chance.string();

				handlerSpy = sinon.spy(msg => {return {lastMessage: msg.message};});
				filterSpy = sinon.spy(obs => obs.where(msg => msg.message == filter));

				store.registerFilteredMessage(MessageA, filterSpy, handlerSpy);
			});

			describe('When a message is published which matches the filter', () => {
				var message;
				beforeEach(() => {
					message = new MessageA(filter);
					dispatcher.dispatch(message);
				});

				it('Should call the handler with the message', () => {
					sinon.assert.calledWith(handlerSpy, message);
				});

				it('Should mutate the state of the store to reflect the result of the handler', () => {
					expect(store._state.get('lastMessage')).to.equal(message.message);
				});
			});

			describe('When a message is published which does not match the filter', () => {
				beforeEach(() => {
					dispatcher.dispatch(new MessageA(chance.string()));
				});

				it('Should not call the handler', () => {
					sinon.assert.notCalled(handlerSpy);
				});
			});
		});

		describe('When registering a message handler on the store', () => {
			var spy;
			beforeEach(() => {
				spy = sinon.spy(msg => { return {lastMessage: msg.message}; });

				store.registerMessage(MessageA, spy);
			});

			describe('When a message of that type is dispatched', () => {
				var message;

				beforeEach(() => {
					message = new MessageA(chance.string());
					dispatcher.dispatch(message);
				});

				it('Should call the registered handler for that message type with the published message', () => {
					sinon.assert.calledWith(spy, message);
				});

				it('Should mutate the state of the Store to include the returned state transformation from the handler', () => {
					expect(store._state.get('lastMessage')).to.equal(message.message);
				});

				describe('When a new message of that type is dispatched', () => {
					var newMessage;

					beforeEach(() => {
						newMessage = new MessageA(chance.string());
						dispatcher.dispatch(newMessage);
					});

					it('Should update the state of the store to reflect the handler', () => {
						expect(store._state.get('lastMessage')).to.equal(newMessage.message);
					});
				});

				describe('When registering a message handler of a different message type', () => {
					var newSpy;
					beforeEach(() => {
						newSpy = sinon.spy(msg => {return {newLastMessage: msg.message};});
						store.registerMessage(MessageB, newSpy);
					});

					describe('When a message of that new type is dispatched', () => {
						var messageB;
						beforeEach(() => {
							messageB = new MessageB(chance.string());
							dispatcher.dispatch(messageB);
						});

						it('Should call the new registered handler', () => {
							sinon.assert.calledWith(newSpy, messageB);
						});

						it('Should not call the original registered handler', () => {
							sinon.assert.neverCalledWith(spy, messageB);
						});

						it('Should mutate the state of the store to include the returned state transformation', () => {
							expect(store._state.get('newLastMessage')).to.equal(messageB.message);
						});

						it('Should still have the mutation from the original message', () => {
							expect(store._state.get('lastMessage')).to.equal(message.message);
						});
					});
				});
			});
		});
	});
});
