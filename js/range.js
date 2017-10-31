(function ($, Vel) {
  'use strict';

  let _defaults = {
  };


  /**
   * @class
   *
   */
  class Range {
    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {

      // If exists, destroy and reinitialize
      if (!!el.M_Range) {
        el.M_Range.destroy();
      }

      this.el = el;
      this.$el = $(el);
      this.el.M_Range = this;

      /**
       * Options for the range
       * @member Range#options
       */
      this.options = $.extend({}, Range.defaults, options);

      this._mousedown = false;

      // Setup
      this._setupThumb();

      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init($els, options) {
      let arr = [];
      $els.each(function() {
        if (!$(this).hasClass('browser-default')) {
          arr.push(new Range(this, options));
        }
      });
      return arr;
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      let domElem = !!el.jquery ? el[0] : el;
      return domElem.M_Range;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this._removeThumb();
      this.el.M_Range = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleRangeChangeBound = this._handleRangeChange.bind(this);
      this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
      this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
      this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
      this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);

      this.el.addEventListener('change', this._handleRangeChangeBound);

      this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
      this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

      this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

      this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
      this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

      this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      this.el.removeEventListener('change', this._handleRangeChangeBound);

      this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
      this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

      this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
      this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

      this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
      this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

      this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
      this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
    }

    /**
     * Handle Range Change
     * @param {Event} e
     */
    _handleRangeChange() {
      $(this.value).html(this.$el.val());

      if (!$(this.thumb).hasClass('active')) {
        this._showRangeBubble();
      }

      let offsetLeft = this._calcRangeOffset();
      $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
    }

    /**
     * Handle Range Mousedown and Touchstart
     * @param {Event} e
     */
    _handleRangeMousedownTouchstart(e) {
      // Set indicator value
      $(this.value).html(this.$el.val());

      this._mousedown = true;
      this.$el.addClass('active');

      if (!$(this.thumb).hasClass('active')) {
        this._showRangeBubble();
      }

      if (e.type !== 'input') {
        let offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
      }
    }

    /**
     * Handle Range Input, Mousemove and Touchmove
     */
    _handleRangeInputMousemoveTouchmove() {
      if (this._mousedown) {
        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        let offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
        $(this.value).html(this.$el.val());
      }
    }

    /**
     * Handle Range Mouseup and Touchend
     */
    _handleRangeMouseupTouchend() {
      this._mousedown = false;
      this.$el.removeClass('active');
    }

    /**
     * Handle Range Blur, Mouseout and Touchleave
     */
    _handleRangeBlurMouseoutTouchleave() {
      if (!this._mousedown) {
        let paddingLeft = parseInt(this.$el.css('padding-left'));
        let marginLeft = (7 + paddingLeft) + 'px';

        if ($(this.thumb).hasClass('active')) {
          Vel(this.thumb, 'stop');
          Vel(
            this.thumb,
            {
              height: '0px',
              width: '0px',
              top: '10px',
              marginLeft: marginLeft
            },
            { duration: 100 }
          );
        }
        $(this.thumb).removeClass('active');
      }
    }

    /**
     * Setup dropdown
     */
    _setupThumb() {
      this.thumb = document.createElement('span');
      this.value = document.createElement('span');
      $(this.thumb).addClass('thumb');
      $(this.value).addClass('value');
      $(this.thumb).append(this.value);
      this.$el.after(this.thumb);
    }

    /**
     * Remove dropdown
     */
    _removeThumb() {
      $(this.thumb).remove();
    }

    /**
     * morph thumb into bubble
     */
    _showRangeBubble() {
      let paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
      let marginLeft = (-7 + paddingLeft) + 'px'; // TODO: fix magic number?
      Vel(
        this.thumb,
        {
          height: "30px",
          width: "30px",
          top: "-30px",
          marginLeft: marginLeft
        },
        { duration: 300, easing: 'easeOutExpo' });
    }

    /**
     * Calculate the offset of the thumb
     * @return {Number}  offset in pixels
     */
    _calcRangeOffset() {
      let width = this.$el.width() - 15;
      let max = parseFloat(this.$el.attr('max'));
      let min = parseFloat(this.$el.attr('min'));
      let percent = (parseFloat(this.$el.val()) - min) / (max - min);
      return percent * width;
    }
  }

  Materialize.Range = Range;

  if (Materialize.jQueryLoaded) {
    Materialize.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range'));
}( cash, Materialize.Vel ));