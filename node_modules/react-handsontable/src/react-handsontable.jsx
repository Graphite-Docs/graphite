import React from 'react';
import Handsontable from 'handsontable';
import SettingsMapper from './settingsMapper';
import 'handsontable/dist/handsontable.full.css';

/**
 * A Handsontable-ReactJS wrapper.
 *
 * To implement, use the `HotTable` tag with properties corresponding to Handsontable options.
 * For example:
 *
 * ```js
 * <HotTable root="hot" data={dataObject} contextMenu={true} colHeaders={true} width={600} height={300} stretchH="all" />
 *
 * // is analogous to
 * let hot = new Handsontable(document.getElementById('hot'), {
 *    data: dataObject,
 *    contextMenu: true,
 *    colHeaders: true,
 *    width: 600
 *    height: 300
 * });
 *
 * ```
 *
 * @class HotTable
 */
export default class HotTable extends React.Component {
  constructor() {
    super();

    this.hotInstance = null;
    this.settingsMapper = new SettingsMapper();
    this.root = null;
  }

  /**
   * Initialize Handsontable after the component has mounted.
   */
  componentDidMount() {
    const newSettings = this.settingsMapper.getSettings(this.props);
    this.hotInstance = new Handsontable(document.getElementById(this.root), newSettings);
  }

  /**
   * Call the `updateHot` method and prevent the component from re-rendering the instance.
   *
   * @param {Object} nextProps
   * @param {Object} nextState
   * @returns {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    this.updateHot(this.settingsMapper.getSettings(nextProps));

    return false;
  }

  /**
   * Destroy the Handsontable instance when the parent component unmounts.
   */
  componentWillUnmount() {
    this.hotInstance.destroy();
  }

  /**
   * Render the table.
   *
   * @returns {XML}
   */
  render() {
    this.root = this.props.root || 'hot' + new Date().getTime();
    return <div id={this.root}></div>
  }

  /**
   * Call the `updateSettings` method for the Handsontable instance.
   * @param newSettings
   */
  updateHot(newSettings) {
    this.hotInstance.updateSettings(newSettings);
  }
}
