import React from 'react';
import DisposableStack from './DisposableStack';

/**
 * Base view to be implemented by all React Views utilizing this Flux framework.
 */
class View extends React.Component {
	constructor(props) {
		super(props);

		this._disposableStack = new DisposableStack();
	}

	get disposableStack() {
		return this._disposableStack;
	}

	/**
	 * Base method intended to be overridden for initialization functionality.
	 * This is a convenience on top of componentWillMount.
	 *
	 * @param  {DisposableStack} disposableStack Stack to register listeners
	 *                                           with so they are automatically cleared when
	 *                                           this view is unmounted.
	 * @return {Void}                 undefined
	 */
	initialize(disposableStack) {

	}

	componentWillMount() {
		this.initialize(this._disposableStack);
	}

	componentWillUnmount() {
		this._disposableStack.dispose();
		this._disposableStack = new DisposableStack();
	}
}

export default View;
