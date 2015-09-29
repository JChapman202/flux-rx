import View from './View';

/**
 * Implementation fo the Flux View which offers pure rendering functioanlity.
 * This is that it will only render when either the props or state has been
 * changed, as defined by a shallow equals between new and old state/props.
 */
class PureView extends View {
	shouldComponentUpdate(nextProps, nextState) {
		return !shallowEquals(this.props, nextProps) || !shallowEquals(this.state, nextState);
	}
}

/**
 * Utility function which evaluates if the two provided instances
 * have all of the same properties as each other and if all
 * of the properties on each other are equal.
 *
 * @param  {Object} objA [description]
 * @param  {Object} objB [description]
 * @return {Boolean}      [description]
 */
function shallowEquals(objA, objB) {
	var returnVal = false;

	if (objA === objB || objA === null && objB === null) {
		returnVal = true;
	}

	if (!returnVal) {
		var propsEqual = true;
		if (Object.keys(objA).length === Object.keys(objB).length) {
			for (var key in objA) {
				propsEqual = propsEqual && objA[key] === objB[key];
			}

			returnVal = propsEqual;
		}
	}

	return returnVal;
}

export default PureView;
