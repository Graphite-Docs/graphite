import React, { Component } from 'react';
import Dropzone from 'react-dropzone';


export default class NewVaultFile extends Component {

  componentDidMount() {
    this.props.loadFilesCollection();
  }

  render() {
    const dropzoneStyle = {
      width  : "100%",
      height : "400px",

      marginTop: "74px",
      background: "#282828",
      paddingTop: "10%",
      cursor: "pointer"
    };

    const show = this.props.show;
    const loading = this.props.loading;
    return (
      <div>
      <div className="navbar-fixed toolbar">
        <nav className="toolbar-nav">
          <div className="nav-wrapper">
            <a href="/vault" className="brand-logo left"><i className="material-icons">arrow_back</i></a>


              <ul className="left toolbar-menu">
                <li><a href="/vault">Back to Vault</a></li>
              </ul>

          </div>
        </nav>
      </div>
      <div className="docs center-align container">
      <h3>Upload a new file</h3>
      {/*<h5>File size limit: 2mb<span className="note"><a onClick={() => Materialize.toast('Accepted files: .doc, .docx, .rtf, .txt, .xlsx, .csv, .png, .tiff, .jpeg, .jpg, .mov, .mp4', 4000)}>?</a></span></h5>*/}
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
      <div className={show}>
        <div className="card hoverable">
          <Dropzone
            style={dropzoneStyle}
            onDrop={ this.props.handleVaultDrop }
            accept="application/rtf, application/x-rtf, text/richtext, text/plain, application/rtf, application/x-rtf, text/rtf, application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, video/quicktime, video/x-ms-wmv,video/mp4,application/pdf,image/png,image/jpeg,image/jpg,image/tiff,image/gif"
            multiple={ false }
            onDropRejected={ this.props.handleDropRejected }>
            <h1 className="upload-cloud"><i className="material-icons white-text large">cloud_upload</i></h1>
            <h3 className="white-text">Drag files or click to upload</h3>
          </Dropzone>

        </div>
      </div>
      </div>
      </div>
    );
  }
}
