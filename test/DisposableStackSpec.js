import DisposableStack from '../src/DisposableStack';
import Rx from 'rx';
import {expect} from 'chai';
import sinon from 'sinon';
import Chance from 'chance';
var chance = new Chance();

describe('DisposableStack', () => {
	var disposableStack;

	beforeEach(() => {
		disposableStack = new DisposableStack();
	});

	describe('When checking if a new disposable instance has been disposed', () => {
		var disposed;

		beforeEach(() => {
			disposed = disposableStack.disposed;
		});

		it('Should return false', () => {
			expect(disposed).to.be.false;
		});
	});

	describe('When adding an Rx.Disposable to the disposable stack', () => {
		var disposable;
		var disposableFunction;

		beforeEach(() => {
			disposableFunction = sinon.stub();
			disposable = new Rx.Disposable(disposableFunction);
			disposableStack.push(disposable);
		});

		it('should not throw', () => {

		});

		describe('When disposing of the disposableStack', () => {
			beforeEach(() => {
				disposableStack.dispose();
			});

			it('should dispose of the added disposable', () => {
				sinon.assert.called(disposableFunction);
			});

			it('When checking to see if the stack is disposed', () => {
				var disposed;
				beforeEach(() => {
					disposed = disposableStack.disposed;
				});

				it('should return true', () => {
					expect(disposed).to.be.true;
				});
			});
		});
	});
});