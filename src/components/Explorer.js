import React, { Component } from "react";
import Header from './Header';
import {
  listFiles
} from 'blockstack';


export default class Explorer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allFiles: [],
      filteredValue: []
    }
  }

  componentDidMount() {
    let allFiles = [];
    listFiles((file) => {
      allFiles.push(file);
      this.setState({ allFiles: allFiles, filteredValue: allFiles });
      return true;
    })
  }

  filterList = (event) => {
    var updatedList = this.state.allFiles;
    updatedList = updatedList.filter(function(item){
      if(item !== undefined) {
        return item.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1;
      }
      return null;
    });
    this.setState({filteredValue: updatedList});
  }

  render(){

    const { filteredValue } = this.state;
    let files;
    if(filteredValue) {
      files = filteredValue;
    } else {
      files = [];
    }
    return(
      <div>
      <Header />
      <div className="explorer container">
        <div className="container docs">
        <div className="row">
          <div className="col s12 m6">
            <h5>Graphite Explorer ({filteredValue.length})</h5>
          </div>
          <div className="col right s12 m6">
          <form className="searchform">
          <fieldset className=" form-group searchfield">
          <input type="text" className="form-control docform form-control-lg searchinput" placeholder="Search files" onChange={this.filterList}/>
          </fieldset>
          </form>
          </div>
        </div>
          <div>
            <ul className="collection">
            {
              files.map(file => {
                return(
                  <li key={file} className="collection-item"><a href={'/file-explorer/' + file}>{file}</a></li>
                )
              })
            }
            </ul>
          </div>
        </div>
      </div>
      </div>
    )
  }
}
