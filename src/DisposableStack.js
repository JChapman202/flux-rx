var priv = new WeakMap();

/**
 * Mutable Stack which is designed to handle Disposable objects.  When this stack is disposed
 * all disposables within the stack should be disposed.
 */
class DisposableStack {
	constructor() {
		priv.set(this, {
			disposed: false,
			disposables: []
		});
	}

	/**
	 * Returns true when this disposableStack has already been disposed.  False otherwise.
	 * @return {Boolean} Indicator as to whether this stack has been disposed or not.
	 */
	get disposed() {
		return priv.get(this).disposed;
	}

	/**
	 * Adds a new disposable to the top of the disposable stack.
	 *
	 * @param  {Disposable} disposable Type which can be disposed (has a dispose method)
	 * @return {[type]}            [description]
	 */
	push(disposable) {
		var state = priv.get(this);

		if (!disposable.dispose || typeof disposable.dispose !== 'function') {
			throw new Error('DisposableStack can only add items which have dispose functions');
		}

		if (state.disposed) {
			throw new Error('Once a DisposableStack is disposed it cannot be used again');
		}

		state.disposables.push(disposable);
	}

	dispose() {
		var state = priv.get(this);

		if (state.disposed) {
			throw new Error('Once a DisposableStack is disposed it cannot be used again');
		}

		state.disposed = true;

		for(var i=0; i < state.disposables.length; i++) {
			state.disposables[i].dispose();
		}

		state.disposables = [];
	}
}

export default DisposableStack;
