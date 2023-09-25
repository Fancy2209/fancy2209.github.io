/* Royale Dependency List: */
/**
 * Generated by Apache Royale Compiler from /home/joshua/Development/Haxe/openfl/lib/openfl/geom/Rectangle.as
 * openfl.geom.Rectangle
 *
 * @fileoverview
 * @externs
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

/** @const */
var openfl = {};
/** @const */
openfl.geom = {};

/**
 * Creates a new Rectangle object with the top-left corner specified by the
 * `x` and `y` parameters and with the specified
 * `width` and `height` parameters. If you call this
 * function without parameters, a rectangle with `x`,
 * `y`, `width`, and `height` properties set
 * to 0 is created.
 * 
 * @asparam x      The _x_ coordinate of the top-left corner of the
 *               rectangle.
 * @asparam y      The _y_ coordinate of the top-left corner of the
 *               rectangle.
 * @asparam width  The width of the rectangle, in pixels.
 * @asparam height The height of the rectangle, in pixels.
 * @constructor
 * @param {number=} x
 * @param {number=} y
 * @param {number=} width
 * @param {number=} height
 */
openfl.geom.Rectangle = function(x, y, width, height) {
};


/**
 * @protected
 * @return {number}
 */
openfl.geom.Rectangle.prototype.get_bottom = function() {
  return 0;
};


/**
 * @protected
 * @param {number} value
 * @return {number}
 */
openfl.geom.Rectangle.prototype.set_bottom = function(value) {
  return 0;
};


/**
 * @protected
 * @return {openfl.geom.Point}
 */
openfl.geom.Rectangle.prototype.get_bottomRight = function() {
  return null;
};


/**
 * @protected
 * @param {openfl.geom.Point} value
 * @return {openfl.geom.Point}
 */
openfl.geom.Rectangle.prototype.set_bottomRight = function(value) {
  return null;
};


/**
 * @export
 * @type {number}
 */
openfl.geom.Rectangle.prototype.height = NaN;


/**
 * @protected
 * @return {number}
 */
openfl.geom.Rectangle.prototype.get_left = function() {
  return 0;
};


/**
 * @protected
 * @param {number} value
 * @return {number}
 */
openfl.geom.Rectangle.prototype.set_left = function(value) {
  return 0;
};


/**
 * @protected
 * @return {number}
 */
openfl.geom.Rectangle.prototype.get_right = function() {
  return 0;
};


/**
 * @protected
 * @param {number} value
 * @return {number}
 */
openfl.geom.Rectangle.prototype.set_right = function(value) {
  return 0;
};


/**
 * @protected
 * @return {openfl.geom.Point}
 */
openfl.geom.Rectangle.prototype.get_size = function() {
  return null;
};


/**
 * @protected
 * @param {openfl.geom.Point} value
 * @return {openfl.geom.Point}
 */
openfl.geom.Rectangle.prototype.set_size = function(value) {
  return null;
};


/**
 * @protected
 * @return {number}
 */
openfl.geom.Rectangle.prototype.get_top = function() {
  return 0;
};


/**
 * @protected
 * @param {number} value
 * @return {number}
 */
openfl.geom.Rectangle.prototype.set_top = function(value) {
  return 0;
};


/**
 * @protected
 * @return {openfl.geom.Point}
 */
openfl.geom.Rectangle.prototype.get_topLeft = function() {
  return null;
};


/**
 * @protected
 * @param {openfl.geom.Point} value
 * @return {openfl.geom.Point}
 */
openfl.geom.Rectangle.prototype.set_topLeft = function(value) {
  return null;
};


/**
 * @export
 * @type {number}
 */
openfl.geom.Rectangle.prototype.width = NaN;


/**
 * @export
 * @type {number}
 */
openfl.geom.Rectangle.prototype.x = NaN;


/**
 * @export
 * @type {number}
 */
openfl.geom.Rectangle.prototype.y = NaN;


/**
 * Returns a new Rectangle object with the same values for the
 * `x`, `y`, `width`, and
 * `height` properties as the original Rectangle object.
 * 
 * @asreturn A new Rectangle object with the same values for the
 *         `x`, `y`, `width`, and
 *         `height` properties as the original Rectangle object.
 * @export
 * @return {openfl.geom.Rectangle}
 */
openfl.geom.Rectangle.prototype.clone = function() {
  return null;
};


/**
 * Determines whether the specified point is contained within the rectangular
 * region defined by this Rectangle object.
 * 
 * @asparam x The _x_ coordinate(horizontal position) of the point.
 * @asparam y The _y_ coordinate(vertical position) of the point.
 * @asreturn A value of `true` if the Rectangle object contains the
 *         specified point; otherwise `false`.
 * @export
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
openfl.geom.Rectangle.prototype.contains = function(x, y) {
  return false;
};


/**
 * Determines whether the specified point is contained within the rectangular
 * region defined by this Rectangle object. This method is similar to the
 * `Rectangle.contains()` method, except that it takes a Point
 * object as a parameter.
 * 
 * @asparam point The point, as represented by its _x_ and _y_
 *              coordinates.
 * @asreturn A value of `true` if the Rectangle object contains the
 *         specified point; otherwise `false`.
 * @export
 * @param {openfl.geom.Point} point
 * @return {boolean}
 */
openfl.geom.Rectangle.prototype.containsPoint = function(point) {
  return false;
};


/**
 * Determines whether the Rectangle object specified by the `rect`
 * parameter is contained within this Rectangle object. A Rectangle object is
 * said to contain another if the second Rectangle object falls entirely
 * within the boundaries of the first.
 * 
 * @asparam rect The Rectangle object being checked.
 * @asreturn A value of `true` if the Rectangle object that you
 *         specify is contained by this Rectangle object; otherwise
 *         `false`.
 * @export
 * @param {openfl.geom.Rectangle} rect
 * @return {boolean}
 */
openfl.geom.Rectangle.prototype.containsRect = function(rect) {
  return false;
};


/**
 * @export
 * @param {openfl.geom.Rectangle} sourceRect
 */
openfl.geom.Rectangle.prototype.copyFrom = function(sourceRect) {
};


/**
 * Determines whether the object specified in the `toCompare`
 * parameter is equal to this Rectangle object. This method compares the
 * `x`, `y`, `width`, and
 * `height` properties of an object against the same properties of
 * this Rectangle object.
 * 
 * @asparam toCompare The rectangle to compare to this Rectangle object.
 * @asreturn A value of `true` if the object has exactly the same
 *         values for the `x`, `y`, `width`,
 *         and `height` properties as this Rectangle object;
 *         otherwise `false`.
 * @export
 * @param {openfl.geom.Rectangle} toCompare
 * @return {boolean}
 */
openfl.geom.Rectangle.prototype.equals = function(toCompare) {
  return false;
};


/**
 * Increases the size of the Rectangle object by the specified amounts, in
 * pixels. The center point of the Rectangle object stays the same, and its
 * size increases to the left and right by the `dx` value, and to
 * the top and the bottom by the `dy` value.
 * 
 * @asparam dx The value to be added to the left and the right of the Rectangle
 *           object. The following equation is used to calculate the new
 *           width and position of the rectangle:
 * @asparam dy The value to be added to the top and the bottom of the
 *           Rectangle. The following equation is used to calculate the new
 *           height and position of the rectangle:
 * @export
 * @param {number} dx
 * @param {number} dy
 */
openfl.geom.Rectangle.prototype.inflate = function(dx, dy) {
};


/**
 * Increases the size of the Rectangle object. This method is similar to the
 * `Rectangle.inflate()` method except it takes a Point object as
 * a parameter.
 *
 * The following two code examples give the same result:
 * 
 * @asparam point The `x` property of this Point object is used to
 *              increase the horizontal dimension of the Rectangle object.
 *              The `y` property is used to increase the vertical
 *              dimension of the Rectangle object.
 * @export
 * @param {openfl.geom.Point} point
 */
openfl.geom.Rectangle.prototype.inflatePoint = function(point) {
};


/**
 * If the Rectangle object specified in the `toIntersect`
 * parameter intersects with this Rectangle object, returns the area of
 * intersection as a Rectangle object. If the rectangles do not intersect,
 * this method returns an empty Rectangle object with its properties set to
 * 0.
 * 
 * @asparam toIntersect The Rectangle object to compare against to see if it
 *                    intersects with this Rectangle object.
 * @asreturn A Rectangle object that equals the area of intersection. If the
 *         rectangles do not intersect, this method returns an empty
 *         Rectangle object; that is, a rectangle with its `x`,
 *         `y`, `width`, and `height`
 *         properties set to 0.
 * @export
 * @param {openfl.geom.Rectangle} toIntersect
 * @return {openfl.geom.Rectangle}
 */
openfl.geom.Rectangle.prototype.intersection = function(toIntersect) {
  return null;
};


/**
 * Determines whether the object specified in the `toIntersect`
 * parameter intersects with this Rectangle object. This method checks the
 * `x`, `y`, `width`, and
 * `height` properties of the specified Rectangle object to see if
 * it intersects with this Rectangle object.
 * 
 * @asparam toIntersect The Rectangle object to compare against this Rectangle
 *                    object.
 * @asreturn A value of `true` if the specified object intersects
 *         with this Rectangle object; otherwise `false`.
 * @export
 * @param {openfl.geom.Rectangle} toIntersect
 * @return {boolean}
 */
openfl.geom.Rectangle.prototype.intersects = function(toIntersect) {
  return false;
};


/**
 * Determines whether or not this Rectangle object is empty.
 * 
 * @asreturn A value of `true` if the Rectangle object's width or
 *         height is less than or equal to 0; otherwise `false`.
 * @export
 * @return {boolean}
 */
openfl.geom.Rectangle.prototype.isEmpty = function() {
  return false;
};


/**
 * Adjusts the location of the Rectangle object, as determined by its
 * top-left corner, by the specified amounts.
 * 
 * @asparam dx Moves the _x_ value of the Rectangle object by this amount.
 * @asparam dy Moves the _y_ value of the Rectangle object by this amount.
 * @export
 * @param {number} dx
 * @param {number} dy
 */
openfl.geom.Rectangle.prototype.offset = function(dx, dy) {
};


/**
 * Adjusts the location of the Rectangle object using a Point object as a
 * parameter. This method is similar to the `Rectangle.offset()`
 * method, except that it takes a Point object as a parameter.
 * 
 * @asparam point A Point object to use to offset this Rectangle object.
 * @export
 * @param {openfl.geom.Point} point
 */
openfl.geom.Rectangle.prototype.offsetPoint = function(point) {
};


/**
 * Sets all of the Rectangle object's properties to 0. A Rectangle object is
 * empty if its width or height is less than or equal to 0.
 *
 *  This method sets the values of the `x`, `y`,
 * `width`, and `height` properties to 0.
 * 
 * @export
 */
openfl.geom.Rectangle.prototype.setEmpty = function() {
};


/**
 * @export
 * @param {number} xa
 * @param {number} ya
 * @param {number} widtha
 * @param {number} heighta
 */
openfl.geom.Rectangle.prototype.setTo = function(xa, ya, widtha, heighta) {
};


/**
 * @export
 * @return {string}
 */
openfl.geom.Rectangle.prototype.toString = function() {
  return null;
};


/**
 * Adds two rectangles together to create a new Rectangle object, by filling
 * in the horizontal and vertical space between the two rectangles.
 *
 * **Note:** The `union()` method ignores rectangles with
 * `0` as the height or width value, such as: `var
 * rect2:Rectangle = new Rectangle(300,300,50,0);`
 * 
 * @asparam toUnion A Rectangle object to add to this Rectangle object.
 * @asreturn A new Rectangle object that is the union of the two rectangles.
 * @export
 * @param {openfl.geom.Rectangle} toUnion
 * @return {openfl.geom.Rectangle}
 */
openfl.geom.Rectangle.prototype.union = function(toUnion) {
  return null;
};


/**
  * @export
  * @type {number} */
openfl.geom.Rectangle.prototype.bottom;


/**
  * @export
  * @type {openfl.geom.Point} */
openfl.geom.Rectangle.prototype.bottomRight;


/**
  * @export
  * @type {number} */
openfl.geom.Rectangle.prototype.left;


/**
  * @export
  * @type {number} */
openfl.geom.Rectangle.prototype.right;


/**
  * @export
  * @type {openfl.geom.Point} */
openfl.geom.Rectangle.prototype.size;


/**
  * @export
  * @type {number} */
openfl.geom.Rectangle.prototype.top;


/**
  * @export
  * @type {openfl.geom.Point} */
openfl.geom.Rectangle.prototype.topLeft;
