import View from '../src/View';
import {expect} from 'chai';
import DisposableStack from '../src/DisposableStack';

class TestView extends View {

}

describe('View', () => {
	describe('When creating a new type which inherits View', () => {
		var testView;

		beforeEach(() => {
			testView = new TestView();
		});

		it('Should be created successfully', () => {
			expect(testView).to.not.be.null;
		});

		it('Should return a DisposableStack instance when requesting the DisposableStack', () => {
			expect(testView.disposableStack).to.be.an.instanceOf(DisposableStack);
		});
	});
});
