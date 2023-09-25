/* Royale Dependency List: */
/**
 * Generated by Apache Royale Compiler from /home/joshua/Development/Haxe/openfl/lib/openfl/utils/Assets.as
 * openfl.utils.Assets
 *
 * @fileoverview
 * @externs
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

/** @const */
var openfl = {};
/** @const */
openfl.utils = {};

/**
 * @constructor
 */
openfl.utils.Assets = function() {
};


/**
 * @export
 * @type {openfl.utils.IAssetCache}
 */
openfl.utils.Assets.cache = null;


/**
 * @export
 * @param {string} type
 * @param {Object} listener
 * @param {boolean=} useCapture
 * @param {number=} priority
 * @param {boolean=} useWeakReference
 */
openfl.utils.Assets.addEventListener = function(type, listener, useCapture, priority, useWeakReference) {
};


/**
 * @export
 * @param {openfl.events.Event} event
 * @return {boolean}
 */
openfl.utils.Assets.dispatchEvent = function(event) {
  return false;
};


/**
 * Returns whether a specific asset exists
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	type	The asset type to match, or null to match any type
 * @asreturn		Whether the requested asset ID and type exists
 * @export
 * @param {string} id
 * @param {openfl.utils.AssetType=} type
 * @return {boolean}
 */
openfl.utils.Assets.exists = function(id, type) {
  return false;
};


/**
 * Gets an instance of an embedded bitmap
 * @usage		var bitmap = new Bitmap (Assets.getBitmapData ("image.png"));
 * @asparam	id		The ID or asset path for the bitmap
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asreturn		A new BitmapData object
 * @export
 * @param {string} id
 * @param {boolean=} useCache
 * @return {openfl.display.BitmapData}
 */
openfl.utils.Assets.getBitmapData = function(id, useCache) {
  return null;
};


/**
 * Gets an instance of an embedded binary asset
 * @usage		var bytes = Assets.getBytes ("file.zip");
 * @asparam	id		The ID or asset path for the asset
 * @asreturn		A new ByteArray object
 * @export
 * @param {string} id
 * @return {openfl.utils.ByteArray}
 */
openfl.utils.Assets.getBytes = function(id) {
  return null;
};


/**
 * Gets an instance of an embedded font
 * @usage		var fontName = Assets.getFont ("font.ttf").fontName;
 * @asparam	id		The ID or asset path for the font
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asreturn		A new Font object
 * @export
 * @param {string} id
 * @param {boolean=} useCache
 * @return {openfl.text.Font}
 */
openfl.utils.Assets.getFont = function(id, useCache) {
  return null;
};


/**
 * @export
 * @param {string} name
 * @return {*}
 */
openfl.utils.Assets.getLibrary = function(name) {
  return null;
};


/**
 * Gets an instance of an included MovieClip
 * @usage		var movieClip = Assets.getMovieClip ("library:BouncingBall");
 * @asparam	id		The ID for the MovieClip
 * @asreturn		A new MovieClip object
 * @export
 * @param {string} id
 * @return {openfl.display.MovieClip}
 */
openfl.utils.Assets.getMovieClip = function(id) {
  return null;
};


/**
 * Gets the file path (if available) for an asset
 * @usage		var path = Assets.getPath ("file.txt");
 * @asparam	id		The ID or asset path for the asset
 * @asreturn		The path to the asset, or null if it does not exist
 * @export
 * @param {string} id
 * @return {string}
 */
openfl.utils.Assets.getPath = function(id) {
  return null;
};


/**
 * Gets an instance of an embedded sound
 * @usage		var sound = Assets.getSound ("sound.wav");
 * @asparam	id		The ID or asset path for the sound
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asreturn		A new Sound object
 * @export
 * @param {string} id
 * @param {boolean=} useCache
 * @return {openfl.media.Sound}
 */
openfl.utils.Assets.getSound = function(id, useCache) {
  return null;
};


/**
 * Gets an instance of an embedded text asset
 * @usage		var text = Assets.getText ("text.txt");
 * @asparam	id		The ID or asset path for the asset
 * @asreturn		A new String object
 * @export
 * @param {string} id
 * @return {string}
 */
openfl.utils.Assets.getText = function(id) {
  return null;
};


/**
 * @export
 * @param {string} type
 * @return {boolean}
 */
openfl.utils.Assets.hasEventListener = function(type) {
  return false;
};


/**
 * @export
 * @param {string} name
 * @return {boolean}
 */
openfl.utils.Assets.hasLibrary = function(name) {
  return false;
};


/**
 * Returns whether an asset is "local", and therefore can be loaded synchronously
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	type	The asset type to match, or null to match any type
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asreturn	Whether the asset is local
 * @export
 * @param {string} id
 * @param {openfl.utils.AssetType=} type
 * @param {boolean=} useCache
 * @return {boolean}
 */
openfl.utils.Assets.isLocal = function(id, type, useCache) {
  return false;
};


/**
 * Returns a list of all embedded assets (by type)
 * @asparam	type	The asset type to match, or null to match any type
 * @asreturn	An array of asset ID values
 * @export
 * @param {openfl.utils.AssetType=} type
 * @return {Array}
 */
openfl.utils.Assets.list = function(type) {
  return null;
};


/**
 * Loads an included bitmap asset asynchronously
 * @usage	Assets.loadBitmapData ("image.png").onComplete (handleImage);
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<BitmapData>
 * @export
 * @param {string} id
 * @param {Object=} useCache
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadBitmapData = function(id, useCache) {
  return null;
};


/**
 * Loads an included byte asset asynchronously
 * @usage	Assets.loadBytes ("file.zip").onComplete (handleBytes);
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<ByteArray>
 * @export
 * @param {string} id
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadBytes = function(id) {
  return null;
};


/**
 * Loads an included font asset asynchronously
 * @usage	Assets.loadFont ("font.ttf").onComplete (handleFont);
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<Font>
 * @export
 * @param {string} id
 * @param {Object=} useCache
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadFont = function(id, useCache) {
  return null;
};


/**
 * Load an included AssetLibrary
 * @asparam	name		The name of the AssetLibrary to load
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<AssetLibrary>
 * @export
 * @param {string} name
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadLibrary = function(name) {
  return null;
};


/**
 * Loads an included music asset asynchronously
 * @usage	Assets.loadMusic ("music.ogg").onComplete (handleMusic);
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<Sound>
 * @export
 * @param {string} id
 * @param {Object=} useCache
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadMusic = function(id, useCache) {
  return null;
};


/**
 * Loads an included MovieClip asset asynchronously
 * @usage	Assets.loadMovieClip ("library:BouncingBall").onComplete (handleMovieClip);
 * @asparam	id 		The ID for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<MovieClip>
 * @export
 * @param {string} id
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadMovieClip = function(id) {
  return null;
};


/**
 * Loads an included sound asset asynchronously
 * @usage	Assets.loadSound ("sound.wav").onComplete (handleSound);
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<Sound>
 * @export
 * @param {string} id
 * @param {Object=} useCache
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadSound = function(id, useCache) {
  return null;
};


/**
 * Loads an included text asset asynchronously
 * @usage	Assets.loadText ("text.txt").onComplete (handleString);
 * @asparam	id 		The ID or asset path for the asset
 * @asparam	useCache		(Optional) Whether to allow use of the asset cache (Default: true)
 * @asparam	handler		(Deprecated) A callback function when the load is completed
 * @asreturn		Returns a Future<String>
 * @export
 * @param {string} id
 * @return {openfl.utils.Future}
 */
openfl.utils.Assets.loadText = function(id) {
  return null;
};


/**
 * Registers a new AssetLibrary with the Assets class
 * @asparam	name		The name (prefix) to use for the library
 * @asparam	library		An AssetLibrary instance to register
 * @export
 * @param {string} name
 * @param {openfl.utils.AssetLibrary} library
 */
openfl.utils.Assets.registerLibrary = function(name, library) {
};


/**
 * @export
 * @param {string} type
 * @param {Object} listener
 * @param {boolean=} capture
 */
openfl.utils.Assets.removeEventListener = function(type, listener, capture) {
};


/**
 * @export
 * @param {string} name
 */
openfl.utils.Assets.unloadLibrary = function(name) {
};