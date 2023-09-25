/* Royale Dependency List: */
/**
 * Generated by Apache Royale Compiler from /home/joshua/Development/Haxe/openfl/lib/openfl/display/Sprite.as
 * openfl.display.Sprite
 *
 * @fileoverview
 * @externs
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

/** @const */
var openfl = {};
/** @const */
openfl.display = {};

/**
 * Creates a new Sprite instance. After you create the Sprite instance, call
 * the `DisplayObjectContainer.addChild()` or
 * `DisplayObjectContainer.addChildAt()` method to add the Sprite
 * to a parent DisplayObjectContainer.
 * @constructor
 * @extends {openfl.display.DisplayObjectContainer}
 */
openfl.display.Sprite = function() {
};


/**
 * @protected
 * @return {boolean}
 */
openfl.display.Sprite.prototype.get_buttonMode = function() {
  return false;
};


/**
 * @protected
 * @param {boolean} value
 * @return {boolean}
 */
openfl.display.Sprite.prototype.set_buttonMode = function(value) {
  return false;
};


/**
 * @protected
 * @return {openfl.display.Graphics}
 */
openfl.display.Sprite.prototype.get_graphics = function() {
  return null;
};


/**
 * @export
 * @type {openfl.display.Sprite}
 */
openfl.display.Sprite.prototype.hitArea = null;


/**
 * @export
 * @type {boolean}
 */
openfl.display.Sprite.prototype.useHandCursor = false;


/**
 * Lets the user drag the specified sprite. The sprite remains draggable
 * until explicitly stopped through a call to the
 * `Sprite.stopDrag()` method, or until another sprite is made
 * draggable. Only one sprite is draggable at a time.
 *
 * Three-dimensional display objects follow the pointer and
 * `Sprite.startDrag()` moves the object within the
 * three-dimensional plane defined by the display object. Or, if the display
 * object is a two-dimensional object and the child of a three-dimensional
 * object, the two-dimensional object moves within the three dimensional
 * plane defined by the three-dimensional parent object.
 * 
 * @asparam lockCenter Specifies whether the draggable sprite is locked to the
 *                   center of the pointer position(`true`), or
 *                   locked to the point where the user first clicked the
 *                   sprite(`false`).
 * @asparam bounds     Value relative to the coordinates of the Sprite's parent
 *                   that specify a constraint rectangle for the Sprite.
 * @export
 * @param {boolean=} lockCenter
 * @param {openfl.geom.Rectangle=} bounds
 */
openfl.display.Sprite.prototype.startDrag = function(lockCenter, bounds) {
};


/**
 * Ends the `startDrag()` method. A sprite that was made draggable
 * with the `startDrag()` method remains draggable until a
 * `stopDrag()` method is added, or until another sprite becomes
 * draggable. Only one sprite is draggable at a time.
 * 
 * @export
 */
openfl.display.Sprite.prototype.stopDrag = function() {
};


/**
  * @export
  * @type {boolean} */
openfl.display.Sprite.prototype.buttonMode;


/**
  * @export
  * @type {openfl.display.DisplayObject} */
openfl.display.Sprite.prototype.dropTarget;


/**
  * @export
  * @type {openfl.display.Graphics} */
openfl.display.Sprite.prototype.graphics;
