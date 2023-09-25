/**
 * Generated by Apache Royale Compiler from Main.as
 * Main
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('Main');
goog.require('FlappyStarlingWeb');
goog.require('openfl.display.Stage');
goog.require('org.apache.royale.utils.Language');
goog.require('Obstacle');
goog.require('World');
goog.require('Game');
goog.require('TitleOverlay');
/* Royale Dependency List: FlappyStarlingWeb,openfl.display.Stage,org.apache.royale.utils.Language*/




/**
 * @constructor
 */
Main = function() {
  var /** @type {openfl.display.Stage} */ stage = new openfl.display.Stage(320, 480, 0xd1f4f7, FlappyStarlingWeb);
  document.body.appendChild(/* implicit cast */ org.apache.royale.utils.Language.as(stage.element, Node, true));
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
Main.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'Main', qName: 'Main', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
Main.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'Main': { type: '', declaredBy: 'Main'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
Main.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./Main.js.map
