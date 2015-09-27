import Dispatcher from '../src/Dispatcher';
import Immutable from 'immutable';
import {expect} from 'chai';
import sinon from 'sinon';
import Chance from 'chance';
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

describe('Dispatcher', () => {
	var dispatcher;

	beforeEach(() => {
		dispatcher = new Dispatcher();
	});

	describe('When subscribing to a message type', () => {
		var disposableA;
		var handlerA;

		beforeEach(() => {
			handlerA = sinon.stub();

			disposableA = dispatcher.messagesOf(MessageA)
				.subscribe(handlerA);
		});

		it('Should return a disposable', () => {
			expect(disposableA).to.not.be.null;
			expect(disposableA.dispose).to.be.a.function;
		});

		describe('When dispatching a message of the subscribed type', () => {
			var message;

			beforeEach(() => {
				message = new MessageA(chance.string());
				dispatcher.dispatch(message);
			});

			it('Should call the subscribed handler with that message', () => {
				sinon.assert.calledWith(handlerA, message);
			});
		});

		describe('When dispatching a message of a non-subscribed type', () => {
			var message;

			beforeEach(() => {
				message = new MessageB(chance.string());
				dispatcher.dispatch(message);
			});

			it('Should not call the subscribed handler', () => {
				sinon.assert.notCalled(handlerA);
			});
		});

		describe('When unsubscribing from the message type', () => {
			beforeEach(() => {
				disposableA.dispose();
			});

			describe('When a message is dispatched of the previously subscribed to type', () => {
				var newMessage;

				beforeEach(() => {
					newMessage = new MessageA(chance.string());
					dispatcher.dispatch(newMessage);
				});

				it('Should not call the previously subscribed handler', () => {
					sinon.assert.neverCalledWith(handlerA, newMessage);
				});
			});
		});

		describe('When another message type is subscribed to', () => {
			var disposableB;
			var handlerB;

			beforeEach(() => {
				handlerB = sinon.stub();
				disposableB = dispatcher.messagesOf(MessageB)
					.subscribe(handlerB);
			});

			describe('When dispatching a message of the new subscribed type', () => {
				var newMessage;

				beforeEach(() => {
					newMessage = new MessageB(chance.string());
					dispatcher.dispatch(newMessage);
				});

				it('Should call the new subscribed handler with that message', () => {
					sinon.assert.calledWith(handlerB, newMessage);
				});

				it('Should not call the original subscription', () => {
					sinon.assert.notCalled(handlerA);
				});
			});
		});
	});
});