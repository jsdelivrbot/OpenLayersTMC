/**
 * @module ol/Image
 */
import {inherits} from './index.js';
import ImageBase from './ImageBase.js';
import ImageState from './ImageState.js';
import {listenOnce, unlistenByKey} from './events.js';
import EventType from './events/EventType.js';
import {getHeight} from './extent.js';

/**
 * @constructor
 * @extends {ol.ImageBase}
 * @param {ol.Extent} extent Extent.
 * @param {number|undefined} resolution Resolution.
 * @param {number} pixelRatio Pixel ratio.
 * @param {string} src Image source URI.
 * @param {?string} crossOrigin Cross origin.
 * @param {ol.ImageLoadFunctionType} imageLoadFunction Image load function.
 */
const ImageWrapper = function(extent, resolution, pixelRatio, src, crossOrigin, imageLoadFunction) {

  ImageBase.call(this, extent, resolution, pixelRatio, ImageState.IDLE);

  /**
   * @private
   * @type {string}
   */
  this.src_ = src;

  /**
   * @private
   * @type {HTMLCanvasElement|Image|HTMLVideoElement}
   */
  this.image_ = new Image();
  if (crossOrigin !== null) {
    this.image_.crossOrigin = crossOrigin;
  }

  /**
   * @private
   * @type {Array.<ol.EventsKey>}
   */
  this.imageListenerKeys_ = null;

  /**
   * @protected
   * @type {ol.ImageState}
   */
  this.state = ImageState.IDLE;

  /**
   * @private
   * @type {ol.ImageLoadFunctionType}
   */
  this.imageLoadFunction_ = imageLoadFunction;

};

inherits(ImageWrapper, ImageBase);


/**
 * @inheritDoc
 * @api
 */
ImageWrapper.prototype.getImage = function() {
  return this.image_;
};


/**
 * Tracks loading or read errors.
 *
 * @private
 */
ImageWrapper.prototype.handleImageError_ = function() {
  this.state = ImageState.ERROR;
  this.unlistenImage_();
  this.changed();
};


/**
 * Tracks successful image load.
 *
 * @private
 */
ImageWrapper.prototype.handleImageLoad_ = function() {
  if (this.resolution === undefined) {
    this.resolution = getHeight(this.extent) / this.image_.height;
  }
  this.state = ImageState.LOADED;
  this.unlistenImage_();
  this.changed();
};


/**
 * Load the image or retry if loading previously failed.
 * Loading is taken care of by the tile queue, and calling this method is
 * only needed for preloading or for reloading in case of an error.
 * @override
 * @api
 */
ImageWrapper.prototype.load = function() {
  if (this.state == ImageState.IDLE || this.state == ImageState.ERROR) {
    this.state = ImageState.LOADING;
    this.changed();
    this.imageListenerKeys_ = [
      listenOnce(this.image_, EventType.ERROR,
        this.handleImageError_, this),
      listenOnce(this.image_, EventType.LOAD,
        this.handleImageLoad_, this)
    ];
    this.imageLoadFunction_(this, this.src_);
  }
};


/**
 * @param {HTMLCanvasElement|Image|HTMLVideoElement} image Image.
 */
ImageWrapper.prototype.setImage = function(image) {
  this.image_ = image;
};


/**
 * Discards event handlers which listen for load completion or errors.
 *
 * @private
 */
ImageWrapper.prototype.unlistenImage_ = function() {
  this.imageListenerKeys_.forEach(unlistenByKey);
  this.imageListenerKeys_ = null;
};

export default ImageWrapper;
