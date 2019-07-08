import React, {setGlobal} from 'reactn';
import { savePageSettings } from '../../helpers/settings';


export default class PageSettings extends React.Component {
  handleClose = () => {
    document.getElementById('page-settings').style.display = "none";
    document.getElementById('dimmer').style.display = "none";
  }
  
  handleMargin = (e, pos) => {
      if(pos === "top") {
        setGlobal({ marginTop: e.target.value });
      } else if(pos === "bottom") {
        setGlobal({ marginBottom: e.target.value });
      } else if(pos === "left") {
        setGlobal({ marginLeft: e.target.value });
      } else if(pos === "right") {
        setGlobal({ marginRight: e.target.value });
      }
  }

  handleOrientation = (e) => {
    let { document } = this.global;
    document.orientation = e.target.value;
    setGlobal({ orientation: e.target.value, document });
  }

  handlePageSettingsSave = () => {
      let { document, marginBottom, marginLeft, marginRight, marginTop } = this.global;
      document.marginBottom = marginBottom;
      document.marginLeft = marginLeft;
      document.marginRight = marginRight;
      document.marginTop = marginTop;
      setGlobal({ document });
  }

  render() {
    const { orientation, marginBottom, marginLeft, marginRight, marginTop } = this.global;
    return (
    <div style={{display: "none"}} id="page-settings" className="custom-modal">
        <h2 onClick={this.handleClose}>X</h2>
        <h3>Page Settings</h3>
        <ul>
            <li>Margins (inches)
                <ul>
                    <li>Top: <input id="margin-top" onChange={(e) => this.handleMargin(e, "top")} value={marginTop} type="number" /></li>
                    <li>Right: <input id="margin-right" onChange={(e) => this.handleMargin(e, "right")} value={marginRight} type="number" /></li>
                    <li>Bottom: <input id="margin-bottom" onChange={(e) => this.handleMargin(e, "bottom")} value={marginBottom} type="number" /></li>
                    <li>Left: <input id="margin-left" onChange={(e) => this.handleMargin(e, "left")} value={marginLeft} type="number" /></li>
                </ul>
            </li>
            <li>Orientation
                <ul>
                    <li>
                        <select onChange={this.handleOrientation} value={orientation}>
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </li>
                </ul>
            </li>
        </ul>
        <div style={{textAlign: "right"}}>
            <button className="save-button" onClick={savePageSettings}>Save</button><button className="cancel-button" onClick={this.handleClose}>Cancel</button>
        </div>
    </div>
    );
  }
}
