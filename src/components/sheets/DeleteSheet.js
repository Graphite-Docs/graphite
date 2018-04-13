import React, { Component } from "react";
import Header from "../Header";
import {
  getFile,
  putFile
} from 'blockstack';

export default class DeleteSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheets: [],
      grid: [
        [],
      ],
      title: "",
      index: "",
      save: "",
      loading: "hide",
      printPreview: false,
      autoSave: "Saved",
      receiverID: "",
      shareModal: "hide",
      shareFile: "",
      initialLoad: ""
    }
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
    this.saveNewFile = this.saveNewFile.bind(this);
  }

  componentDidMount() {
    getFile("spread.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ sheets: JSON.parse(fileContents || '{}').sheets })
        console.log("loaded");
     }).then(() =>{
       let sheets = this.state.sheets;
       const thisSheet = sheets.find((sheet) => { return sheet.id == this.props.match.params.id});
       let index = thisSheet && thisSheet.id;
       console.log(index);
       function findObjectIndex(sheet) {
           return sheet.id == index;
       }
       let grid = thisSheet && thisSheet.grid;
       this.setState({ grid: grid || this.state.grid, title: thisSheet && thisSheet.title, index: sheets.findIndex(findObjectIndex) })
     })
      .catch(error => {
        console.log(error);
      });
    }

  handleDeleteItem() {
    const object = {};
    object.title = this.state.title;
    object.grid = this.state.grid;
    object.id = parseInt(this.props.match.params.id, 10);
    this.setState({ sheets: [...this.state.sheets, this.state.sheets.splice(this.state.index, 1)]})
    console.log(this.state.grid);
    this.setState({ loading: "show", save: "hide" });
    this.saveNewFile();
  };

  saveNewFile() {
    this.setState({ loading: "show" });
    this.setState({ save: "hide"});
    putFile("spread.json", JSON.stringify(this.state), {encrypt: true})
      .then(() => {
        console.log(JSON.stringify(this.state));
        this.setState({ loading: "hide" });
        window.location.href = '/sheets';
      })
      .catch(e => {
        console.log("e");
        console.log(e);

      });
  }

  render() {
    const loading = this.state.loading;
    const save = this.state.save;
    return (
      <div>
        <Header />
        <div className="container docs">
          <div className="card doc-card delete-card">
            <div className="double-space doc-margin delete-doc center-align">
            <h5>
              Delete Sheet
            </h5>
            <h6>Are you sure you want to delete <strong>{this.state.title}</strong>?
            </h6>
            <div className={save}>
            <button className="btn red" onClick={this.handleDeleteItem}>
              Delete
            </button>
            <a href="/sheets"><button className="btn grey">
              No, go back
            </button></a>
            </div>
            <div className={loading}>
            <div className="preloader-wrapper small active">
              <div className="spinner-layer spinner-green-only">
                <div className="circle-clipper left">
                  <div className="circle"></div>
                </div><div className="gap-patch">
                  <div className="circle"></div>
                </div><div className="circle-clipper right">
                  <div className="circle"></div>
                </div>
              </div>
            </div>
            </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
