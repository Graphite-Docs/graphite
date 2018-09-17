import React, { Component } from "react";
import LoadingBar from '../LoadingBar';

export default class GDocs extends Component {

  render(){
    const { filteredGDocs, importAll } = this.props
    return(
      <div className="gDocs">
      {
        importAll ?
        <div>
          <h3>Please wait while your Google Docs are imported...</h3>
          <LoadingBar />
        </div> :
        <div>
        <div className="row">
          <div className="col s12 m6">
            <h5>Your Google Docs ({filteredGDocs.length})</h5>
          </div>
          <div className="col right s12 m6">
            <form className="searchform">
              <fieldset className=" form-group searchfield">
                <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search Google Docs" onChange={this.props.filterGDocsList}/>
              </fieldset>
            </form>
          </div>
        </div>

          <button onClick={this.props.importAllGDocs} className="btn green">Import All</button>

          <ul className="collection import-docs-collection">
            {
              filteredGDocs.map(doc => {
                return(
                  <li className="collection-item import-docs-item" key={doc.id}>
                    <span>{doc.name}</span><br />
                    <a className="btn-flat blue-text" onClick={() => this.props.singleGDoc(doc)}>Import Doc</a>
                  </li>
                )
              })
            }
          </ul>
          </div>
      }
      </div>
    )
  }
}
