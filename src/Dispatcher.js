import Rx from 'rx';
import Immutable from 'immutable';

var priv = new WeakMap();

/**
 * Flux dispatcher used for dispatching and subscribing to event messages
 * throughout the application.
 */
class Dispatcher {
	constructor() {
		priv.set(this, {
			subjects: new Immutable.Map()
		});
	}

	/**
	 * Returns an [Rx.Observable]{@link https://github.com/Reactive-Extensions/RxJS} which
	 * can be observed for invocations of the provided messageType.
	 *
	 * @param  {Function} messageType Constructor function for the type of message to be observed.
	 *
	 * @return {Rx.Observable} Observable stream of occurances of this event type.
	 */
	messagesOf(messageType) {
		return getSub.call(this, messageType).observable;
	}

	/**
	 * Dispatches the provided message to all current subscribers of that
	 * message type that is being dispatched.
	 *
	 * @param  {Object} message The message which is being dispatched.
	 * @return {Void} undefined
	 */
	dispatch(message) {
		getPublisher.call(this, message).onNext(message);
	}
}

function getPublisher(message) {
	var state = priv.get(this);
	var pub = state.subjects.get(message.constructor);

	if (pub) {
		return pub.subject;
	}
	else {
		return emptySubject;
	}
}

function getSub(messageType) {
	var state = priv.get(this);
	var sub = state.subjects.get(messageType);

	if (!sub) {
		var subject = new Rx.Subject();
		var observable = Rx.Observable.create((observer) => {
			var disposable = subject.subscribe(observer);

			return () => {
				disposable.dispose();

				if (!subject.hasObservers()) {
					state.subjects = state.subjects.delete(messageType);
				}
			};
		});

		var sub = {subject, observable};
		state.subjects = state.subjects.set(messageType, sub);
	}

	return sub;
}

var emptySubject = new Rx.Subject();

export default Dispatcher;