import Immutable from 'immutable';
import Rx from 'rx';
import DisposableStack from './DisposableStack';

var priv = new WeakMap();

/**
 * Base class for all Flux stores.
 */
class Store {
	/**
	 * Constructor that initializes the state of the Store.
	 *
	 * @param  {Dispatcher} dispatcher   Dispatcher to use for subscribing to messages.
	 * @param  {Object} initialState Object which defines the initial state to set for the store.
	 * @returns {Store} Constructed Store instance.
	 */
	constructor(dispatcher, initialState = {}) {
		priv.set(this, {
			dispatcher,
			state: new Immutable.Map().merge(initialState),
			eventStream: new Rx.Subject(),
			disposableStack: new DisposableStack()
		});
	}

	/**
	 * Registers a store observer for all instances messages of
	 * the provided messageType.
	 * @param  {Function} messageType Type of message to be observed.  All occurances of this
	 *                                message type should cause the handler function to be called.
	 * @param  {Function} handler     state transition function which is called when an event matching
	 *                                the subscription is called.  This function will receive the message
	 *                                instance which triggered the handler call and return any modifications
	 *                                to the state of the store which will be used to update the store.
	 * @return {Void}                 undefined
	 */
	registerMessage(messageType, handler) {
		return this.registerFilteredMessage(messageType, obs => obs, handler);
	}

	/**
	 * Registers a store observer for a subset of the instances of the messages
	 * of the provided messageType.
	 *
	 * @param  {Function} messageType Type of message to be observed.
	 * @param  {Function} filter      Filter function which takes an observable and returns the filtered observable.
	 * @param  {Function} handler     state transition function which is called when an event matching
	 *                                the subscription is called.  This function will receive the message
	 *                                instance which triggered the handler call and return any modifications
	 *                                to the state of the store which will be used to update the store.
	 * @return {Void}                 undefined
	 */
	registerFilteredMessage(messageType, filter, handler) {
		var state = priv.get(this);

		state.disposableStack.push(
			filter(state.dispatcher.messagesOf(messageType))
				.subscribe(createMessageHandler.call(this, handler))
		);
	}

	/**
	 * [registerStore description]
	 * @param  {[type]} storeInstance [description]
	 * @param  {[type]} handler       [description]
	 * @return {[type]}               [description]
	 */
	registerStore(storeInstance, handler) {
		var state = priv.get(this);

		state.disposableStack.push(
			storeInstance.eventStream.subscribe(createStoreHandler.call(this, storeInstance, handler))
		);
	}

	/**
	 * Returns the current state of the store.
	 * @return {Immutable.Map} Immutable map of the current state of this store.
	 */
	get _state() {
		return priv.get(this).state;
	}

	/**
	 * Observable event stream indicating whenever the state of this store changed.
	 * @return {Rx.Observable} observable event stream of changes within this store.
	 */
	get eventStream() {
		return priv.get(this).eventStream;
	}
}

function createMessageHandler(handler) {
	return (message) => {
		var stateUpdate = handler.call(this, message);
		applyState.call(this, stateUpdate);
	};
}

function createStoreHandler(store, handler) {
	return () => {
		var stateUpdate = handler.call(this, store);
		applyState.call(this, stateUpdate);
	};
}

function applyState(stateUpdate) {
	var state = priv.get(this);
	var newState = state.state.merge(stateUpdate);

	if (newState !== state.state) {
		state.state = newState;
		state.eventStream.onNext();
	}
}

export default Store;
