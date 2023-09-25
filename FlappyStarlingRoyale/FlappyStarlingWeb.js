/**
 * Generated by Apache Royale Compiler from FlappyStarlingWeb.as
 * FlappyStarlingWeb
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('FlappyStarlingWeb');
/* Royale Dependency List: Game,openfl.system.Capabilities,openfl.utils.AssetLibrary,openfl.utils.AssetManifest,openfl.utils.Assets,org.apache.royale.utils.Language*/

goog.require('openfl.display.Sprite');



/**
 * @constructor
 * @extends {openfl.display.Sprite}
 */
FlappyStarlingWeb = function() {
  var self = this;
  FlappyStarlingWeb.base(this, 'constructor');
  this.FlappyStarlingWeb__starling = new starling.core.Starling(Game, this.stage);
  this.FlappyStarlingWeb__starling.addEventListener(starling.events.Event.ROOT_CREATED, function() {
    self.FlappyStarlingWeb_loadAssets(org.apache.royale.utils.Language.closure(self.FlappyStarlingWeb_startGame, self, 'FlappyStarlingWeb_startGame'));
  });
  this.FlappyStarlingWeb__starling.start();
};
goog.inherits(FlappyStarlingWeb, openfl.display.Sprite);


/**
 * @private
 * @type {starling.core.Starling}
 */
FlappyStarlingWeb.prototype.FlappyStarlingWeb__starling = null;


/**
 * @private
 * @param {Function} onComplete
 */
FlappyStarlingWeb.prototype.FlappyStarlingWeb_loadAssets = function(onComplete) {
  var self = this;
  var /** @type {starling.assets.AssetManager} */ assets = new starling.assets.AssetManager();
  assets.verbose = openfl.system.Capabilities.isDebugger;
  var /** @type {openfl.utils.AssetManifest} */ manifest = new openfl.utils.AssetManifest();
  manifest.addText("assets/textures/1x/atlas.xml");
  manifest.addBitmapData("assets/textures/1x/atlas.png");
  manifest.addFont("bradybunch");
  manifest.addBitmapData("assets/fonts/1x/bradybunch.png");
  manifest.addText("assets/fonts/1x/bradybunch.fnt");
  manifest.addSound(["assets/sounds/flap.mp3"]);
  manifest.addSound(["assets/sounds/pass.mp3"]);
  manifest.addSound(["assets/sounds/crash.mp3"]);
  openfl.utils.AssetLibrary.loadFromManifest(manifest).onComplete(function(library) {
    openfl.utils.Assets.registerLibrary("default", library);
    var /** @type {starling.textures.Texture} */ atlasTexture = starling.textures.Texture.fromBitmapData(openfl.utils.Assets.getBitmapData("assets/textures/1x/atlas.png"), false);
    var /** @type {string} */ atlasXml = openfl.utils.Assets.getText("assets/textures/1x/atlas.xml");
    var /** @type {starling.textures.Texture} */ bradybunchTexture = starling.textures.Texture.fromBitmapData(openfl.utils.Assets.getBitmapData("assets/fonts/1x/bradybunch.png"), false);
    var /** @type {string} */ bradybunchXml = openfl.utils.Assets.getText("assets/fonts/1x/bradybunch.fnt");
    var /** @type {starling.text.BitmapFont} */ bitmapFont = new starling.text.BitmapFont(bradybunchTexture, bradybunchXml);
    starling.text.TextField.registerCompositor(bitmapFont, "bradybunch");
    assets.addAsset("atlas", atlasTexture);
    assets.addAsset("atlas", new starling.textures.TextureAtlas(atlasTexture, atlasXml));
    assets.addAsset("pass", openfl.utils.Assets.getSound("assets/sounds/pass.mp3"));
    assets.addAsset("flap", openfl.utils.Assets.getSound("assets/sounds/flap.mp3"));
    assets.addAsset("crash", openfl.utils.Assets.getSound("assets/sounds/crash.mp3"));
    onComplete(assets);
  });
};


/**
 * @private
 * @param {starling.assets.AssetManager} assets
 */
FlappyStarlingWeb.prototype.FlappyStarlingWeb_startGame = function(assets) {
  var /** @type {Game} */ game = org.apache.royale.utils.Language.as(this.FlappyStarlingWeb__starling.root, Game);
  game.start(assets);
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
FlappyStarlingWeb.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'FlappyStarlingWeb', qName: 'FlappyStarlingWeb', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
FlappyStarlingWeb.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'FlappyStarlingWeb': { type: '', declaredBy: 'FlappyStarlingWeb'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
FlappyStarlingWeb.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./FlappyStarlingWeb.js.map
