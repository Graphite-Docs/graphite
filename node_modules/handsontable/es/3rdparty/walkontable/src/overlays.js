var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { getScrollableElement, getScrollbarWidth, getScrollLeft, getScrollTop } from './../../../helpers/dom/element';
import { arrayEach } from './../../../helpers/array';
import { isKey } from './../../../helpers/unicode';
import { isMobileBrowser } from './../../../helpers/browser';
import EventManager from './../../../eventManager';
import Overlay from './overlay/_base.js';

/**
 * @class Overlays
 */

var Overlays = function () {
  /**
   * @param {Walkontable} wotInstance
   */
  function Overlays(wotInstance) {
    _classCallCheck(this, Overlays);

    this.wot = wotInstance;

    // legacy support
    this.instance = this.wot;
    this.eventManager = new EventManager(this.wot);

    this.wot.update('scrollbarWidth', getScrollbarWidth());
    this.wot.update('scrollbarHeight', getScrollbarWidth());

    this.scrollableElement = getScrollableElement(this.wot.wtTable.TABLE);

    this.prepareOverlays();

    this.destroyed = false;
    this.keyPressed = false;
    this.spreaderLastSize = {
      width: null,
      height: null
    };
    this.overlayScrollPositions = {
      master: {
        top: 0,
        left: 0
      },
      top: {
        top: null,
        left: 0
      },
      bottom: {
        top: null,
        left: 0
      },
      left: {
        top: 0,
        left: null
      }
    };

    this.pendingScrollCallbacks = {
      master: {
        top: 0,
        left: 0
      },
      top: {
        left: 0
      },
      bottom: {
        left: 0
      },
      left: {
        top: 0
      }
    };

    this.verticalScrolling = false;
    this.horizontalScrolling = false;
    this.delegatedScrollCallback = false;

    this.registeredListeners = [];

    this.registerListeners();
  }

  /**
   * Prepare overlays based on user settings.
   *
   * @returns {Boolean} Returns `true` if changes applied to overlay needs scroll synchronization.
   */


  _createClass(Overlays, [{
    key: 'prepareOverlays',
    value: function prepareOverlays() {
      var syncScroll = false;

      if (this.topOverlay) {
        syncScroll = this.topOverlay.updateStateOfRendering() || syncScroll;
      } else {
        this.topOverlay = Overlay.createOverlay(Overlay.CLONE_TOP, this.wot);
      }

      if (!Overlay.hasOverlay(Overlay.CLONE_BOTTOM)) {
        this.bottomOverlay = {
          needFullRender: false,
          updateStateOfRendering: function updateStateOfRendering() {
            return false;
          }
        };
      }
      if (!Overlay.hasOverlay(Overlay.CLONE_BOTTOM_LEFT_CORNER)) {
        this.bottomLeftCornerOverlay = {
          needFullRender: false,
          updateStateOfRendering: function updateStateOfRendering() {
            return false;
          }
        };
      }

      if (this.bottomOverlay) {
        syncScroll = this.bottomOverlay.updateStateOfRendering() || syncScroll;
      } else {
        this.bottomOverlay = Overlay.createOverlay(Overlay.CLONE_BOTTOM, this.wot);
      }

      if (this.leftOverlay) {
        syncScroll = this.leftOverlay.updateStateOfRendering() || syncScroll;
      } else {
        this.leftOverlay = Overlay.createOverlay(Overlay.CLONE_LEFT, this.wot);
      }

      if (this.topOverlay.needFullRender && this.leftOverlay.needFullRender) {
        if (this.topLeftCornerOverlay) {
          syncScroll = this.topLeftCornerOverlay.updateStateOfRendering() || syncScroll;
        } else {
          this.topLeftCornerOverlay = Overlay.createOverlay(Overlay.CLONE_TOP_LEFT_CORNER, this.wot);
        }
      }

      if (this.bottomOverlay.needFullRender && this.leftOverlay.needFullRender) {
        if (this.bottomLeftCornerOverlay) {
          syncScroll = this.bottomLeftCornerOverlay.updateStateOfRendering() || syncScroll;
        } else {
          this.bottomLeftCornerOverlay = Overlay.createOverlay(Overlay.CLONE_BOTTOM_LEFT_CORNER, this.wot);
        }
      }

      if (this.wot.getSetting('debug') && !this.debug) {
        this.debug = Overlay.createOverlay(Overlay.CLONE_DEBUG, this.wot);
      }

      return syncScroll;
    }

    /**
     * Refresh and redraw table
     */

  }, {
    key: 'refreshAll',
    value: function refreshAll() {
      if (!this.wot.drawn) {
        return;
      }
      if (!this.wot.wtTable.holder.parentNode) {
        // Walkontable was detached from DOM, but this handler was not removed
        this.destroy();

        return;
      }
      this.wot.draw(true);

      if (this.verticalScrolling) {
        this.leftOverlay.onScroll();
      }

      if (this.horizontalScrolling) {
        this.topOverlay.onScroll();
      }

      this.verticalScrolling = false;
      this.horizontalScrolling = false;
    }

    /**
     * Register all necessary event listeners.
     */

  }, {
    key: 'registerListeners',
    value: function registerListeners() {
      var _this = this;

      var topOverlayScrollable = this.topOverlay.mainTableScrollableElement;
      var leftOverlayScrollable = this.leftOverlay.mainTableScrollableElement;

      var listenersToRegister = [];
      listenersToRegister.push([document.documentElement, 'keydown', function (event) {
        return _this.onKeyDown(event);
      }]);
      listenersToRegister.push([document.documentElement, 'keyup', function () {
        return _this.onKeyUp();
      }]);
      listenersToRegister.push([document, 'visibilitychange', function () {
        return _this.onKeyUp();
      }]);
      listenersToRegister.push([topOverlayScrollable, 'scroll', function (event) {
        return _this.onTableScroll(event);
      }]);

      if (topOverlayScrollable !== leftOverlayScrollable) {
        listenersToRegister.push([leftOverlayScrollable, 'scroll', function (event) {
          return _this.onTableScroll(event);
        }]);
      }

      if (this.topOverlay.needFullRender) {
        listenersToRegister.push([this.topOverlay.clone.wtTable.holder, 'scroll', function (event) {
          return _this.onTableScroll(event);
        }]);
        listenersToRegister.push([this.topOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        }]);
      }

      if (this.bottomOverlay.needFullRender) {
        listenersToRegister.push([this.bottomOverlay.clone.wtTable.holder, 'scroll', function (event) {
          return _this.onTableScroll(event);
        }]);
        listenersToRegister.push([this.bottomOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        }]);
      }

      if (this.leftOverlay.needFullRender) {
        listenersToRegister.push([this.leftOverlay.clone.wtTable.holder, 'scroll', function (event) {
          return _this.onTableScroll(event);
        }]);
        listenersToRegister.push([this.leftOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        }]);
      }

      if (this.topLeftCornerOverlay && this.topLeftCornerOverlay.needFullRender) {
        listenersToRegister.push([this.topLeftCornerOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        }]);
      }

      if (this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.needFullRender) {
        listenersToRegister.push([this.bottomLeftCornerOverlay.clone.wtTable.holder, 'wheel', function (event) {
          return _this.onTableScroll(event);
        }]);
      }

      if (this.topOverlay.trimmingContainer !== window && this.leftOverlay.trimmingContainer !== window) {
        // This is necessary?
        // eventManager.addEventListener(window, 'scroll', (event) => this.refreshAll(event));
        listenersToRegister.push([window, 'wheel', function (event) {
          var overlay = void 0;
          var deltaY = event.wheelDeltaY || event.deltaY;
          var deltaX = event.wheelDeltaX || event.deltaX;

          if (_this.topOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'top';
          } else if (_this.bottomOverlay.clone && _this.bottomOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'bottom';
          } else if (_this.leftOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'left';
          } else if (_this.topLeftCornerOverlay && _this.topLeftCornerOverlay.clone && _this.topLeftCornerOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'topLeft';
          } else if (_this.bottomLeftCornerOverlay && _this.bottomLeftCornerOverlay.clone && _this.bottomLeftCornerOverlay.clone.wtTable.holder.contains(event.realTarget)) {
            overlay = 'bottomLeft';
          }

          if (overlay == 'top' && deltaY !== 0 || overlay == 'left' && deltaX !== 0 || overlay == 'bottom' && deltaY !== 0 || (overlay === 'topLeft' || overlay === 'bottomLeft') && (deltaY !== 0 || deltaX !== 0)) {

            event.preventDefault();
          }
        }]);
      }

      while (listenersToRegister.length) {
        var listener = listenersToRegister.pop();
        this.eventManager.addEventListener(listener[0], listener[1], listener[2]);

        this.registeredListeners.push(listener);
      }
    }

    /**
     * Deregister all previously registered listeners.
     */

  }, {
    key: 'deregisterListeners',
    value: function deregisterListeners() {
      while (this.registeredListeners.length) {
        var listener = this.registeredListeners.pop();
        this.eventManager.removeEventListener(listener[0], listener[1], listener[2]);
      }
    }

    /**
     * Scroll listener
     *
     * @param {Event} event
     */

  }, {
    key: 'onTableScroll',
    value: function onTableScroll(event) {
      // if mobile browser, do not update scroll positions, as the overlays are hidden during the scroll
      if (isMobileBrowser()) {
        return;
      }
      var masterHorizontal = this.leftOverlay.mainTableScrollableElement;
      var masterVertical = this.topOverlay.mainTableScrollableElement;
      var target = event.target;

      // For key press, sync only master -> overlay position because while pressing Walkontable.render is triggered
      // by hot.refreshBorder
      if (this.keyPressed) {
        if (masterVertical !== window && target !== window && !event.target.contains(masterVertical) || masterHorizontal !== window && target !== window && !event.target.contains(masterHorizontal)) {
          return;
        }
      }

      if (event.type === 'scroll') {
        this.syncScrollPositions(event);
      } else {
        this.translateMouseWheelToScroll(event);
      }
    }

    /**
     * Key down listener
     */

  }, {
    key: 'onKeyDown',
    value: function onKeyDown(event) {
      this.keyPressed = isKey(event.keyCode, 'ARROW_UP|ARROW_RIGHT|ARROW_DOWN|ARROW_LEFT');
    }

    /**
     * Key up listener
     */

  }, {
    key: 'onKeyUp',
    value: function onKeyUp() {
      this.keyPressed = false;
    }

    /**
     * Translate wheel event into scroll event and sync scroll overlays position
     *
     * @private
     * @param {Event} event
     * @returns {Boolean}
     */

  }, {
    key: 'translateMouseWheelToScroll',
    value: function translateMouseWheelToScroll(event) {
      var topOverlay = this.topOverlay.clone.wtTable.holder;
      var bottomOverlay = this.bottomOverlay.clone ? this.bottomOverlay.clone.wtTable.holder : null;
      var leftOverlay = this.leftOverlay.clone.wtTable.holder;
      var topLeftCornerOverlay = this.topLeftCornerOverlay && this.topLeftCornerOverlay.clone ? this.topLeftCornerOverlay.clone.wtTable.holder : null;
      var bottomLeftCornerOverlay = this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.clone ? this.bottomLeftCornerOverlay.clone.wtTable.holder : null;
      var mouseWheelSpeedRatio = -0.2;
      var deltaY = event.wheelDeltaY || -1 * event.deltaY;
      var deltaX = event.wheelDeltaX || -1 * event.deltaX;
      var parentHolder = null;
      var eventMockup = { type: 'wheel' };
      var tempElem = event.target;
      var delta = null;

      // Fix for extremely slow header scrolling with a mousewheel on Firefox
      if (event.deltaMode === 1) {
        deltaY *= 120;
        deltaX *= 120;
      }

      while (tempElem != document && tempElem != null) {
        if (tempElem.className.indexOf('wtHolder') > -1) {
          parentHolder = tempElem;
          break;
        }
        tempElem = tempElem.parentNode;
      }
      eventMockup.target = parentHolder;

      if (parentHolder === topLeftCornerOverlay || parentHolder === bottomLeftCornerOverlay) {
        this.syncScrollPositions(eventMockup, mouseWheelSpeedRatio * deltaX, 'x');
        this.syncScrollPositions(eventMockup, mouseWheelSpeedRatio * deltaY, 'y');
      } else {
        if (parentHolder === topOverlay || parentHolder === bottomOverlay) {
          delta = deltaY;
        } else if (parentHolder === leftOverlay) {
          delta = deltaX;
        }

        this.syncScrollPositions(eventMockup, mouseWheelSpeedRatio * delta);
      }

      return false;
    }

    /**
     * Synchronize scroll position between master table and overlay table.
     *
     * @private
     * @param {Event|Object} event
     * @param {Number} [fakeScrollValue=null]
     * @param {String} [fakeScrollDirection=null] `x` or `y`.
     */

  }, {
    key: 'syncScrollPositions',
    value: function syncScrollPositions(event) {
      var fakeScrollValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var fakeScrollDirection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (this.destroyed) {
        return;
      }
      if (arguments.length === 0) {
        this.syncScrollWithMaster();

        return;
      }

      var masterHorizontal = this.leftOverlay.mainTableScrollableElement;
      var masterVertical = this.topOverlay.mainTableScrollableElement;
      var target = event.target;
      var tempScrollValue = 0;
      var scrollValueChanged = false;
      var topOverlay = void 0;
      var leftOverlay = void 0;
      var topLeftCornerOverlay = void 0;
      var bottomLeftCornerOverlay = void 0;
      var bottomOverlay = void 0;
      var delegatedScroll = false;
      var preventOverflow = this.wot.getSetting('preventOverflow');

      if (this.topOverlay.needFullRender) {
        topOverlay = this.topOverlay.clone.wtTable.holder;
      }

      if (this.bottomOverlay.needFullRender) {
        bottomOverlay = this.bottomOverlay.clone.wtTable.holder;
      }

      if (this.leftOverlay.needFullRender) {
        leftOverlay = this.leftOverlay.clone.wtTable.holder;
      }

      if (this.leftOverlay.needFullRender && this.topOverlay.needFullRender) {
        topLeftCornerOverlay = this.topLeftCornerOverlay.clone.wtTable.holder;
      }

      if (this.leftOverlay.needFullRender && this.bottomOverlay.needFullRender) {
        bottomLeftCornerOverlay = this.bottomLeftCornerOverlay.clone.wtTable.holder;
      }

      if (target === document) {
        target = window;
      }

      if (target === masterHorizontal || target === masterVertical) {
        if (preventOverflow) {
          tempScrollValue = getScrollLeft(this.scrollableElement);
        } else {
          tempScrollValue = getScrollLeft(target);
        }

        // if scrolling the master table - populate the scroll values to both top and left overlays
        this.horizontalScrolling = this.overlayScrollPositions.master.left !== tempScrollValue;
        this.overlayScrollPositions.master.left = tempScrollValue;
        scrollValueChanged = true;

        if (this.pendingScrollCallbacks.master.left > 0) {
          this.pendingScrollCallbacks.master.left--;
        } else {
          if (topOverlay && topOverlay.scrollLeft !== tempScrollValue) {

            if (fakeScrollValue == null) {
              this.pendingScrollCallbacks.top.left++;
            }

            topOverlay.scrollLeft = tempScrollValue;
            delegatedScroll = masterHorizontal !== window;
          }

          if (bottomOverlay && bottomOverlay.scrollLeft !== tempScrollValue) {

            if (fakeScrollValue == null) {
              this.pendingScrollCallbacks.bottom.left++;
            }

            bottomOverlay.scrollLeft = tempScrollValue;
            delegatedScroll = masterHorizontal !== window;
          }
        }

        tempScrollValue = getScrollTop(target);

        this.verticalScrolling = this.overlayScrollPositions.master.top !== tempScrollValue;
        this.overlayScrollPositions.master.top = tempScrollValue;
        scrollValueChanged = true;

        if (this.pendingScrollCallbacks.master.top > 0) {
          this.pendingScrollCallbacks.master.top--;
        } else if (leftOverlay && leftOverlay.scrollTop !== tempScrollValue) {
          if (fakeScrollValue == null) {
            this.pendingScrollCallbacks.left.top++;
          }

          leftOverlay.scrollTop = tempScrollValue;
          delegatedScroll = masterVertical !== window;
        }
      } else if (target === bottomOverlay) {
        tempScrollValue = getScrollLeft(target);

        // if scrolling the bottom overlay - populate the horizontal scroll to the master table
        this.overlayScrollPositions.bottom.left = tempScrollValue;
        scrollValueChanged = true;

        if (this.pendingScrollCallbacks.bottom.left > 0) {
          this.pendingScrollCallbacks.bottom.left--;
        } else {
          if (fakeScrollValue == null) {
            this.pendingScrollCallbacks.master.left++;
          }

          masterHorizontal.scrollLeft = tempScrollValue;

          if (topOverlay && topOverlay.scrollLeft !== tempScrollValue) {
            if (fakeScrollValue == null) {
              this.pendingScrollCallbacks.top.left++;
            }

            topOverlay.scrollLeft = tempScrollValue;
            delegatedScroll = masterVertical !== window;
          }
        }

        // "fake" scroll value calculated from the mousewheel event
        if (fakeScrollValue !== null) {
          scrollValueChanged = true;
          masterVertical.scrollTop += fakeScrollValue;
        }
      } else if (target === topOverlay) {
        tempScrollValue = getScrollLeft(target);

        // if scrolling the top overlay - populate the horizontal scroll to the master table
        this.overlayScrollPositions.top.left = tempScrollValue;
        scrollValueChanged = true;

        if (this.pendingScrollCallbacks.top.left > 0) {
          this.pendingScrollCallbacks.top.left--;
        } else {

          if (fakeScrollValue == null) {
            this.pendingScrollCallbacks.master.left++;
          }

          masterHorizontal.scrollLeft = tempScrollValue;
        }

        // "fake" scroll value calculated from the mousewheel event
        if (fakeScrollValue !== null) {
          scrollValueChanged = true;
          masterVertical.scrollTop += fakeScrollValue;
        }

        if (bottomOverlay && bottomOverlay.scrollLeft !== tempScrollValue) {
          if (fakeScrollValue == null) {
            this.pendingScrollCallbacks.bottom.left++;
          }

          bottomOverlay.scrollLeft = tempScrollValue;
          delegatedScroll = masterVertical !== window;
        }
      } else if (target === leftOverlay) {
        tempScrollValue = getScrollTop(target);

        // if scrolling the left overlay - populate the vertical scroll to the master table
        if (this.overlayScrollPositions.left.top !== tempScrollValue) {
          this.overlayScrollPositions.left.top = tempScrollValue;
          scrollValueChanged = true;

          if (this.pendingScrollCallbacks.left.top > 0) {
            this.pendingScrollCallbacks.left.top--;
          } else {
            if (fakeScrollValue == null) {
              this.pendingScrollCallbacks.master.top++;
            }

            masterVertical.scrollTop = tempScrollValue;
          }
        }

        // "fake" scroll value calculated from the mousewheel event
        if (fakeScrollValue !== null) {
          scrollValueChanged = true;
          masterVertical.scrollLeft += fakeScrollValue;
        }
      } else if (target === topLeftCornerOverlay || target === bottomLeftCornerOverlay) {
        if (fakeScrollValue !== null) {
          scrollValueChanged = true;

          if (fakeScrollDirection === 'x') {
            masterVertical.scrollLeft += fakeScrollValue;
          } else if (fakeScrollDirection === 'y') {
            masterVertical.scrollTop += fakeScrollValue;
          }
        }
      }

      if (!this.keyPressed && scrollValueChanged && event.type === 'scroll') {
        if (this.delegatedScrollCallback) {
          this.delegatedScrollCallback = false;
        } else {
          this.refreshAll();
        }

        if (delegatedScroll) {
          this.delegatedScrollCallback = true;
        }
      }
    }

    /**
     * Synchronize overlay scrollbars with the master scrollbar
     */

  }, {
    key: 'syncScrollWithMaster',
    value: function syncScrollWithMaster() {
      var master = this.topOverlay.mainTableScrollableElement;
      var scrollLeft = master.scrollLeft,
          scrollTop = master.scrollTop;


      if (this.topOverlay.needFullRender) {
        this.topOverlay.clone.wtTable.holder.scrollLeft = scrollLeft;
      }
      if (this.bottomOverlay.needFullRender) {
        this.bottomOverlay.clone.wtTable.holder.scrollLeft = scrollLeft;
      }
      if (this.leftOverlay.needFullRender) {
        this.leftOverlay.clone.wtTable.holder.scrollTop = scrollTop;
      }
    }

    /**
     * Update the main scrollable elements for all the overlays.
     */

  }, {
    key: 'updateMainScrollableElements',
    value: function updateMainScrollableElements() {
      this.deregisterListeners();

      this.leftOverlay.updateMainScrollableElement();
      this.topOverlay.updateMainScrollableElement();

      if (this.bottomOverlay.needFullRender) {
        this.bottomOverlay.updateMainScrollableElement();
      }

      this.scrollableElement = getScrollableElement(this.wot.wtTable.TABLE);

      this.registerListeners();
    }

    /**
     *
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.eventManager.destroy();
      this.topOverlay.destroy();

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.destroy();
      }
      this.leftOverlay.destroy();

      if (this.topLeftCornerOverlay) {
        this.topLeftCornerOverlay.destroy();
      }

      if (this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.clone) {
        this.bottomLeftCornerOverlay.destroy();
      }

      if (this.debug) {
        this.debug.destroy();
      }
      this.destroyed = true;
    }

    /**
     * @param {Boolean} [fastDraw=false]
     */

  }, {
    key: 'refresh',
    value: function refresh() {
      var fastDraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (this.topOverlay.areElementSizesAdjusted && this.leftOverlay.areElementSizesAdjusted) {
        var container = this.wot.wtTable.wtRootElement.parentNode || this.wot.wtTable.wtRootElement;
        var width = container.clientWidth;
        var height = container.clientHeight;

        if (width !== this.spreaderLastSize.width || height !== this.spreaderLastSize.height) {
          this.spreaderLastSize.width = width;
          this.spreaderLastSize.height = height;
          this.adjustElementsSize();
        }
      }

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.refresh(fastDraw);
      }

      this.leftOverlay.refresh(fastDraw);
      this.topOverlay.refresh(fastDraw);

      if (this.topLeftCornerOverlay) {
        this.topLeftCornerOverlay.refresh(fastDraw);
      }

      if (this.bottomLeftCornerOverlay && this.bottomLeftCornerOverlay.clone) {
        this.bottomLeftCornerOverlay.refresh(fastDraw);
      }

      if (this.debug) {
        this.debug.refresh(fastDraw);
      }
    }

    /**
     * Adjust overlays elements size and master table size
     *
     * @param {Boolean} [force=false]
     */

  }, {
    key: 'adjustElementsSize',
    value: function adjustElementsSize() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var totalColumns = this.wot.getSetting('totalColumns');
      var totalRows = this.wot.getSetting('totalRows');
      var headerRowSize = this.wot.wtViewport.getRowHeaderWidth();
      var headerColumnSize = this.wot.wtViewport.getColumnHeaderHeight();
      var hiderStyle = this.wot.wtTable.hider.style;

      hiderStyle.width = headerRowSize + this.leftOverlay.sumCellSizes(0, totalColumns) + 'px';
      hiderStyle.height = headerColumnSize + this.topOverlay.sumCellSizes(0, totalRows) + 1 + 'px';

      this.topOverlay.adjustElementsSize(force);
      this.leftOverlay.adjustElementsSize(force);

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.adjustElementsSize(force);
      }
    }

    /**
     *
     */

  }, {
    key: 'applyToDOM',
    value: function applyToDOM() {
      if (!this.topOverlay.areElementSizesAdjusted || !this.leftOverlay.areElementSizesAdjusted) {
        this.adjustElementsSize();
      }
      this.topOverlay.applyToDOM();

      if (this.bottomOverlay.clone) {
        this.bottomOverlay.applyToDOM();
      }

      this.leftOverlay.applyToDOM();
    }

    /**
     * Get the parent overlay of the provided element.
     *
     * @param {HTMLElement} element
     * @returns {Object|null}
     */

  }, {
    key: 'getParentOverlay',
    value: function getParentOverlay(element) {
      if (!element) {
        return null;
      }

      var overlays = [this.topOverlay, this.leftOverlay, this.bottomOverlay, this.topLeftCornerOverlay, this.bottomLeftCornerOverlay];
      var result = null;

      arrayEach(overlays, function (elem, i) {
        if (!elem) {
          return;
        }

        if (elem.clone && elem.clone.wtTable.TABLE.contains(element)) {
          result = elem.clone;
        }
      });

      return result;
    }
  }]);

  return Overlays;
}();

export default Overlays;