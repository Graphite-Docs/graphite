/**
 * RemoteStorage connect widget
 * @constructor
 *
 * @param {object}  remoteStorage          - remoteStorage instance
 * @param {object}  options                - Widget options
 * @param {boolean} options.leaveOpen      - Do not minimize widget when user clicks
 *                                           outside of it (default: false)
 * @param {number}  options.autoCloseAfter - Time after which the widget closes
 *                                           automatically in ms (default: 1500)
 * @param {boolean} options.skipInitial    - Don't show the initial connect hint,
 *                                           but show sign-in screen directly instead
 *                                           (default: false)
 * @param {boolean} options.logging        - Enable logging (default: false)
 */
let Widget = function(remoteStorage, options={}) {
  this.rs = remoteStorage;

  this.leaveOpen      = options.leaveOpen ? options.leaveOpen : false;
  this.autoCloseAfter = options.autoCloseAfter ? options.autoCloseAfter : 1500;
  this.skipInitial    = options.skipInitial ? options.skipInitial : false;
  this.logging        = options.logging ? options.logging : false;

  // true if we have remoteStorage connection's info
  this.active = false;

  // remoteStorage is connected!
  this.online = false;

  // widget is minimized ?
  this.closed = false;

  this.lastSynced = null;
  this.lastSyncedUpdateLoop = null;
};

Widget.prototype = {

  log (...msg) {
    if (this.logging) {
      console.debug('[RS-WIDGET] ', ...msg);
    }
  },

  // handle events !
  eventHandler (event, msg) {
    this.log('EVENT: ', event);
    switch (event) {
      case 'ready':
        this.setState(this.state);
        break;
      case 'sync-req-done':
        this.rsSyncButton.classList.add("rs-rotate");
        break;
      case 'sync-done':
        this.rsSyncButton.classList.remove("rs-rotate");

        if (this.rsWidget.classList.contains('rs-state-unauthorized') ||
            !this.rs.remote.online) {
          this.updateLastSyncedOutput();
        } else if (this.rs.remote.online) {
          this.lastSynced = new Date();
          let subHeadlineEl = document.querySelector('.rs-box-connected .rs-sub-headline');
          subHeadlineEl.innerHTML = 'Synced just now';
        }

        if (!this.closed && this.shouldCloseWhenSyncDone) {
          setTimeout(this.close.bind(this), this.autoCloseAfter);
        }
        break;
      case 'disconnected':
        this.active = false;
        this.setOnline();
        this.setBackendClass(); // removes all backend CSS classes
        this.open();
        this.setInitialState();
        break;
      case 'connected':
        this.active = true;
        this.online = true;
        if (this.rs.hasFeature('Sync')) {
          this.shouldCloseWhenSyncDone = true;
          this.rs.on('sync-req-done', () => this.eventHandler('sync-req-done'));
          this.rs.on('sync-done', () => this.eventHandler('sync-done'));
        } else {
          this.rsSyncButton.classList.add('rs-hidden');
          setTimeout(this.close.bind(this), this.autoCloseAfter);
        }
        let connectedUser = this.rs.remote.userAddress;
        this.rsConnectedUser.innerHTML = connectedUser;
        this.setBackendClass(this.rs.backend);
        this.rsConnectedLabel.textContent = 'Connected';
        this.setState('connected');
        break;
      case 'network-offline':
        this.setOffline();
        break;
      case 'network-online':
        this.setOnline();
        break;
      case 'error':
        this.setBackendClass(this.rs.backend);

        if (msg.name === 'DiscoveryError') {
          this.handleDiscoveryError(msg);
        } else if (msg.name === 'SyncError') {
          this.handleSyncError(msg);
        } else if (msg.name === 'Unauthorized') {
          this.handleUnauthorized(msg);
        } else {
          console.debug('Encountered unhandled error', msg);
        }
        break;
    }
  },

  setState (state) {
    if (state) {
      this.log('Setting state ', state);
      let lastSelected = document.querySelector('.rs-box.rs-selected');
      if (lastSelected) {
        lastSelected.classList.remove('rs-selected');
      }

      let toSelect = document.querySelector('.rs-box.rs-box-'+state);
      if (toSelect) {
        toSelect.classList.add('rs-selected');
      }

      let currentStateClass = this.rsWidget.className.match(/rs-state-\S+/g)[0];
      this.rsWidget.classList.remove(currentStateClass);
      this.rsWidget.classList.add(`rs-state-${state || this.state}`);

      this.state = state;
    }
  },


  /**
   * Set widget to its inital state
   *
   * @private
   */
  setInitialState () {
    if (this.skipInitial) {
      this.showChooseOrSignIn();
    } else {
      this.setState('initial');
    }
  },

  /**
   * Create the widget element and add styling.
   *
   * @returns {object} The widget's DOM element
   *
   * @private
   */
  createHtmlTemplate () {
    const element = document.createElement('div');
    const style = document.createElement('style');
    style.innerHTML = require('raw!./assets/styles.css');

    element.id = "remotestorage-widget";
    element.innerHTML = require('html!./assets/widget.html');
    element.appendChild(style);

    return element;
  },

  /**
   * Save all interactive DOM elements as variables for later access.
   *
   * @private
   */
  setupElements () {
    this.rsWidget = document.querySelector('.rs-widget');
    this.rsInitial = document.querySelector('.rs-box-initial');
    this.rsChoose = document.querySelector('.rs-box-choose');
    this.rsConnected = document.querySelector('.rs-box-connected');
    this.rsSignIn = document.querySelector('.rs-box-sign-in');

    this.rsConnectedLabel = document.querySelector('.rs-box-connected .rs-sub-headline');
    this.rsChooseRemoteStorageButton = document.querySelector('button.rs-choose-rs');
    this.rsChooseDropboxButton = document.querySelector('button.rs-choose-dropbox');
    this.rsChooseGoogleDriveButton = document.querySelector('button.rs-choose-googledrive');
    this.rsErrorBox = document.querySelector('.rs-box-error .rs-error-message');

    // check if apiKeys is set for Dropbox or Google [googledrive, dropbox]
    // to show/hide relative buttons only if needed
    if (! this.rs.apiKeys.hasOwnProperty('googledrive')) {
      this.rsChooseGoogleDriveButton.parentNode.removeChild(this.rsChooseGoogleDriveButton);
    }

    if (! this.rs.apiKeys.hasOwnProperty('dropbox')) {
      this.rsChooseDropboxButton.parentNode.removeChild(this.rsChooseDropboxButton);
    }

    this.rsSignInForm = document.querySelector('.rs-sign-in-form');
    this.rsConnectButton = document.querySelector('.rs-connect');

    this.rsDisconnectButton = document.querySelector('.rs-disconnect');
    this.rsSyncButton = document.querySelector('.rs-sync');
    this.rsLogo = document.querySelector('.rs-widget-icon');

    this.rsErrorReconnectLink = document.querySelector('.rs-box-error a.rs-reconnect');
    this.rsErrorDisconnectButton = document.querySelector('.rs-box-error button.rs-disconnect');

    this.rsConnectedUser = document.querySelector('.rs-connected-text h1.rs-user');
  },

  /**
   * Setup all event handlers
   *
   * @private
   */
  setupHandlers () {
    this.rs.on('connected', () => this.eventHandler('connected'));
    this.rs.on('ready', () => this.eventHandler('ready'));
    this.rs.on('disconnected', () => this.eventHandler('disconnected'));
    this.rs.on('network-online', () => this.eventHandler('network-online'));
    this.rs.on('network-offline', () => this.eventHandler('network-offline'));
    this.rs.on('error', (error) => this.eventHandler('error', error));

    this.setEventListeners();
    this.setClickHandlers();
  },

  /**
   * Append widget to the DOM.
   *
   * If an elementId is specified, it will be appended to that element,
   * otherwise it will be appended to the document's body.
   *
   * @param  {String} [elementId] - Widget's parent
   */
  attach (elementId) {
    const domElement = this.createHtmlTemplate();

    if (elementId) {
      const parent = document.getElementById(elementId);
      if (!parent) {
        throw "Failed to find target DOM element with id=\"" + elementId + "\"";
      }
      parent.appendChild(domElement);
    } else {
      document.body.appendChild(domElement);
    }

    this.setupElements();
    this.setupHandlers();
    this.setInitialState();
  },

  setEventListeners () {
    // Sign-in form
    this.rsSignInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let userAddress = document.querySelector('input[name=rs-user-address]').value;
      this.rsConnectButton.disabled = true;
      this.rs.connect(userAddress);
    });
  },

  /**
   * Show the screen for choosing a backend if there is more than one backend
   * to choose from. Otherwise it directly shows the remoteStorage connect
   * screen.
   *
   * @private
   */
  showChooseOrSignIn () {
    // choose backend only if some providers are declared
    if (this.rs.apiKeys && Object.keys(this.rs.apiKeys).length > 0) {
      this.setState('choose');
    } else {
      this.setState('sign-in');
    }
  },

  setClickHandlers () {
    // Initial button
    this.rsInitial.addEventListener('click', () => this.showChooseOrSignIn() );

    // Choose RS button
    this.rsChooseRemoteStorageButton.addEventListener('click', () => this.setState('sign-in') );

    // Choose Dropbox button
    this.rsChooseDropboxButton.addEventListener('click', () => this.rs["dropbox"].connect() );

    // Choose Google Drive button
    this.rsChooseGoogleDriveButton.addEventListener('click', () => this.rs["googledrive"].connect() );

    // Disconnect button
    this.rsDisconnectButton.addEventListener('click', () => this.rs.disconnect() );

    this.rsErrorReconnectLink.addEventListener('click', () => this.rs.reconnect() );
    this.rsErrorDisconnectButton.addEventListener('click', () => this.rs.disconnect() );

    // Sync button
    if (this.rs.hasFeature('Sync')) {
      this.rsSyncButton.addEventListener('click', () => {
        if (this.rsSyncButton.classList.contains('rs-rotate')) {
          this.rs.stopSync();
          this.rsSyncButton.classList.remove("rs-rotate");
        } else {
          this.rs.startSync();
          this.rsSyncButton.classList.add("rs-rotate");
        }
      });
    }

    // Reduce to icon only if connected and clicked outside of widget
    document.addEventListener('click', () => this.close() );

    // Clicks on the widget stop the above event
    this.rsWidget.addEventListener('click', e => e.stopPropagation() );

    // Click on the logo to toggle the widget's open/close state
    this.rsLogo.addEventListener('click', () => this.toggle() );
  },

  /**
   * Toggle between the widget's open/close state.
   *
   * When then widget is open and in initial state, it will show the backend
   * chooser screen.
   */
  toggle () {
    if (this.closed) {
      this.open();
    } else {
      if (this.state === 'initial') {
        this.showChooseOrSignIn();
      } else {
        this.close();
      }
    }
  },

  /**
   * Open the widget.
   */
  open () {
    this.closed = false;
    this.rsWidget.classList.remove('rs-closed');
    this.shouldCloseWhenSyncDone = false; // prevent auto-closing when user opened the widget
  },

  /**
   * Close the widget to only show the icon.
   *
   * If the ``leaveOpen`` config is true or there is no storage connected,
   * the widget will not close.
   */
  close () {
    // don't do anything when we have an error
    if (this.state === 'error') { return; }

    if (!this.leaveOpen && this.active) {
      this.closed = true;
      this.rsWidget.classList.add('rs-closed');
    } else if (this.active) {
      this.setState('connected');
    } else {
      this.setInitialState();
    }
  },

  /**
   * Mark the widget as offline.
   *
   * This will not do anything when no account is connected.
   *
   * @private
   */
  setOffline () {
    if (this.online) {
      this.rsWidget.classList.add('rs-offline');
      this.rsConnectedLabel.textContent = 'Offline';
      this.online = false;
    }
  },

  /**
   * Mark the widget as online.
   *
   * @private
   */
  setOnline () {
    if (!this.online) {
      this.rsWidget.classList.remove('rs-offline');
      if (this.active) {
        this.rsConnectedLabel.textContent = 'Connected';
      }
    }
    this.online = true;
  },

  /**
   * Set the remoteStorage backend type to show the appropriate icon.
   * If no backend is given, all existing backend CSS classes will be removed.
   *
   * @param {string} [backend]
   *
   * @private
   */
  setBackendClass (backend) {
    this.rsWidget.classList.remove('rs-backend-remotestorage');
    this.rsWidget.classList.remove('rs-backend-dropbox');
    this.rsWidget.classList.remove('rs-backend-googledrive');

    if (backend) {
      this.rsWidget.classList.add(`rs-backend-${backend}`);
    }
  },

  showErrorBox (errorMsg) {
    this.rsErrorBox.innerHTML = errorMsg;
    this.setState('error');
  },

  hideErrorBox () {
    this.rsErrorBox.innerHTML = '';
    this.close();
  },

  handleDiscoveryError (error) {
    let msgContainer = document.querySelector('.rs-sign-in-error');
    msgContainer.innerHTML = error.message;
    msgContainer.classList.remove('rs-hidden');
    msgContainer.classList.add('rs-visible');
    this.rsConnectButton.disabled = false;
  },

  handleSyncError (/* error */) {
    // console.debug('Encountered SyncError', error);
    this.open();
    this.showErrorBox('App sync error');
  },

  handleUnauthorized (error) {
    if (error.code && error.code === 'access_denied') {
      this.rs.disconnect();
    } else {
      this.open();
      this.showErrorBox(error.message + " ");
      this.rsErrorBox.appendChild(this.rsErrorReconnectLink);
      this.rsErrorReconnectLink.classList.remove('rs-hidden');
    }
  },

  updateLastSyncedOutput () {
    if (!this.lastSynced) { return; } // don't do anything when we've never synced yet
    let now = new Date();
    let secondsSinceLastSync = Math.round((now.getTime() - this.lastSynced.getTime())/1000);
    let subHeadlineEl = document.querySelector('.rs-box-connected .rs-sub-headline');
    subHeadlineEl.innerHTML = `Synced ${secondsSinceLastSync} seconds ago`;
  }
};

module.exports = Widget;
