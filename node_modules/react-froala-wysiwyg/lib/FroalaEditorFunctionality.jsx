/* global $ */
import React from 'react';

export default class FroalaEditorFunctionality extends React.Component {
  constructor(props) {
    super(props);

    // Tag on which the editor is initialized.
    this.tag = null;
    this.defaultTag = 'div';
    this.listeningEvents = [];

    // Jquery wrapped element.
    this.$element = null;

    // Editor element.
    this.editor = null;

    // Editor options config
    this.config = {
      immediateReactModelUpdate: false,
      reactIgnoreAttrs: null
    };

    this.editorInitialized = false;

    this.SPECIAL_TAGS = ['img', 'button', 'input', 'a'];
    this.INNER_HTML_ATTR = 'innerHTML';
    this.hasSpecialTag = false;

    this.oldModel = null;
  }

  // Before first time render.
  componentWillMount () {
    this.tag = this.props.tag || this.defaultTag;
  }

  // After first time render.
  componentDidMount () {
    let tagName = this.refs.el.tagName.toLowerCase();
    if (this.SPECIAL_TAGS.indexOf(tagName) != -1) {
      this.tag = tagName;
      this.hasSpecialTag = true;
    }

    if (this.props.onManualControllerReady) {
      this.generateManualController();
    } else {
      this.createEditor();
    }
  }

  componentWillUnmount () {
    this.destroyEditor();
  }

  componentDidUpdate () {
    if (JSON.stringify(this.oldModel) == JSON.stringify(this.props.model)) {
      return;
    }

    this.setContent();
  }

  createEditor () {
    if (this.editorInitialized) {
      return;
    }

    this.config = this.props.config || this.config;

    this.$element = $(this.refs.el);

    this.setContent(true);

    this.registerEvents();
    this.$editor = this.$element.froalaEditor(this.config).data('froala.editor').$el;
    this.initListeners();
  }

  setContent (firstTime) {
    if (this.props.model || this.props.model == '') {
      this.oldModel = this.props.model;

      if (this.hasSpecialTag) {
        this.setSpecialTagContent();
      } else {
        this.setNormalTagContent(firstTime);
      }
    }
  }

  setNormalTagContent (firstTime) {
    let self = this;

    function htmlSet() {
      self.$element.froalaEditor('html.set', self.props.model || '', true);
      if (self.editorInitialized) {
        //This will reset the undo stack everytime the model changes externally. Can we fix this?
        self.$element.froalaEditor('undo.reset');
        self.$element.froalaEditor('undo.saveStep');
      }
    }

    if (firstTime) {
      if (this.config.initOnClick) {
        this.registerEvent(this.$element, 'froalaEditor.initializationDelayed', () => {
          htmlSet();
        });
        this.registerEvent(this.$element, 'froalaEditor.initialized', () => {
          this.editorInitialized = true;
        });
      } else {
        this.registerEvent(this.$element, 'froalaEditor.initialized', () => {
          this.editorInitialized = true;
          htmlSet();
        });
      }
    } else {
      htmlSet();
    }
  }

  setSpecialTagContent () {
    let tags = this.props.model;

    // add tags on element
    if (tags) {
      for (let attr in tags) {
        if (tags.hasOwnProperty(attr) && attr != this.INNER_HTML_ATTR) {
          this.$element.attr(attr, tags[attr]);
        }
      }

      if (tags.hasOwnProperty(this.INNER_HTML_ATTR)) {
        this.$element[0].innerHTML = tags[this.INNER_HTML_ATTR];
      }
    }
  }

  destroyEditor () {
    if (this.$element) {
      this.listeningEvents && this.$element.off(this.listeningEvents.join(' '));
      this.$editor.off('keyup');
      this.$element.froalaEditor('destroy');
      this.listeningEvents.length = 0;
      this.$element = null;
      this.editorInitialized = false;
    }
  }

  getEditor () {
    if (this.$element) {
      return this.$element.froalaEditor.bind(this.$element);
    }

    return null;
  }

  generateManualController () {
    let self = this;

    let controls = {
      initialize: () => self.createEditor.call(self),
      destroy: () => self.destroyEditor.call(self),
      getEditor: () => self.getEditor.call(self)
    };

    this.props.onManualControllerReady(controls);
  }

  updateModel () {
    if (!this.props.onModelChange) {
      return;
    }

    let modelContent = '';

    if (this.hasSpecialTag) {
      let attributeNodes = this.$element[0].attributes;
      let attrs = {};

      for (let i = 0; i < attributeNodes.length; i++ ) {
        let attrName = attributeNodes[i].name;
        if (this.config.reactIgnoreAttrs && this.config.reactIgnoreAttrs.indexOf(attrName) != -1) {
          continue;
        }
        attrs[attrName] = attributeNodes[i].value;
      }

      if (this.$element[0].innerHTML) {
        attrs[this.INNER_HTML_ATTR] = this.$element[0].innerHTML;
      }

      modelContent = attrs;
    } else {
      let returnedHtml = this.$element.froalaEditor('html.get');
      if (typeof returnedHtml === 'string') {
        modelContent = returnedHtml;
      }
    }

    this.oldModel = modelContent;
    this.props.onModelChange(modelContent);
  }

  initListeners () {
    let self = this;

    // bind contentChange and keyup event to froalaModel
    this.registerEvent(this.$element, 'froalaEditor.contentChanged',function () {
      self.updateModel();
    });
    if (this.config.immediateReactModelUpdate) {
      this.registerEvent(this.$editor, 'keyup', function () {
        self.updateModel();
      });
    }
  }

  // register event on jquery editor element
  registerEvent (element, eventName, callback) {
    if (!element || !eventName || !callback) {
      return;
    }

    this.listeningEvents.push(eventName);
    element.on(eventName, callback);
  }

  registerEvents () {
    let events = this.config.events;
    if (!events) {
      return;
    }

    for (let event in events) {
      if (events.hasOwnProperty(event)) {
        this.registerEvent(this.$element, event, events[event]);
      }
    }
  }
};
