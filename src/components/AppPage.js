import React, { Component } from "react";
import Signin from "./Signin";
import Header from "./Header";
import {
  isUserSignedIn,
  redirectToSignIn,
  loadUserData,
  signUserOut
} from "blockstack";

export default class AppPage extends Component {

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin;
    redirectToSignIn(origin, origin + "/manifest.json", [
      "store_write",
      "publish_data"
    ]);
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    const { value, sheets, files, contacts } = this.props;
    let merged = sheets.concat(value).concat(files);
    let recentFiles;
    let mergedRecent = merged.map(merge => {
      let date;
      if(merge.updated) {
        date = merge.updated;
      } else {
        date = merge.uploaded;
      }
      let d = new Date();
      d.setDate(d.getDate()-14);
      if(new Date(date) > d) {
        return merge;
      }
      return merge;
    })
    recentFiles = mergedRecent.filter(function(n){ return n !== undefined })

    //Docs variables
    let words = value.map(a => a.words).reduce((a, b) => a + b, 0);
    let docTags = value.map(a => a.tags);
    let newDocTags = docTags.filter(function(n){ return n !== undefined });
    let mergedDocTags = [].concat.apply([], newDocTags).length;
    let docCollabs = value.map(a => a.sharedWith)
    let newDocCollabs = docCollabs.filter(function(n){ return n !== undefined });
    let mergedDocCollabs = [].concat.apply([], newDocCollabs).length;
    //Sheets variables
    let sheetsTags = sheets.map(a => a.tags);
    let newSheetsTags = sheetsTags.filter(function(n){ return n !== undefined });
    let mergedSheetsTags = [].concat.apply([], newSheetsTags).length;
    let sheetsCollabs = sheets.map(a => a.sharedWith);
    let newSheetsCollabs = sheetsCollabs.filter(function(n){ return n !== undefined });
    let mergedSheetsCollabs = [].concat.apply([], newSheetsCollabs).length;
    //Files variables
    let filesTags = files.map(a => a.tags);
    let newFilesTags = filesTags.filter(function(n){ return n !== undefined });
    let mergedFilesTags = [].concat.apply([], newFilesTags).length;
    let filesCollabs = files.map(a => a.sharedWith);
    let newFilesCollabs = filesCollabs.filter(function(n){ return n !== undefined });
    let mergedFilesCollabs = [].concat.apply([], newFilesCollabs).length;
    let fileTypes = files.map(a => a.types);
    window.$.extend({
      countUnique : function(fileTypes) {
        var result = [];
        window.$.each(fileTypes, function(i,v) {
          if(window.$.inArray(v, result) === -1) {
            result.push(v);
          }
        });
        return result.length;
      }
    });
    let fileTypesCount = window.$.countUnique(fileTypes);

    //Contacts variables
    let contactsTypes = contacts.map(a => a.types);
    let newContactsTypes = contactsTypes.filter(function(n){ return n !== undefined });
    let mergedContactsTypes = [].concat.apply([], newContactsTypes).length;

    return (
      <div>
        <Header />
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            {!isUserSignedIn() ? (
              <Signin handleSignIn={this.handleSignIn} />
            ) : (
              <div>
                <div>
                  {/*teammate.includes(loadUserData().username) || loadUserData().username === 'admin.graphite' ? <p className="settings-icon"><a href="/admin"><i className="material-icons">settings</i></a></p> : <p />*/}
                  {loadUserData().username === "justin.personal.id" ? (
                    <p className="settings-icon">
                      <a href="/journalism-admin">
                        <i className="material-icons">settings</i>
                      </a>
                    </p>
                  ) : (
                    <p />
                  )}
                  {loadUserData().username === "admin.graphite" ? (
                    <p className="settings-icon">
                      <a href="/admin">
                        <i className="material-icons">settings</i>
                      </a>
                    </p>
                  ) : (
                    <p />
                  )}
                </div>
                <div className="row app-page">

                  <div className="col s12 m6 l3">
                    <a href="/documents">
                    <div className="appPage">
                      <div className="row">

                          <div className="col s12">
                            <h5>Documents
                              <span>
                                <img
                                  alt="documents"
                                  className="appPageIcons"
                                  src="https://i.imgur.com/C71m2Zs.png"
                                  />
                              </span>
                            </h5>
                            <strong><h3>{value.length}</h3></strong>
                          </div>
                          <div className="col s6">
                            <p>Words</p>
                            <strong><h5>{words}</h5></strong>
                          </div>
                          <div className="col s6">
                            <p>Tags</p>
                            <strong><h5>{mergedDocTags}</h5></strong>
                          </div>
                          <div className="col s6">
                            <p>Collaborators</p>
                            <strong><h5>{mergedDocCollabs}</h5></strong>
                          </div>

                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="col s12 m6 l3">
                    <a href="/sheets">
                    <div className="appPage">
                      <div className="row">
                          <div className="col s12">
                            <h5>Sheets
                              <span>
                                <img
                                  alt="Sheets"
                                  className="appPageIcons"
                                  src="https://i.imgur.com/6jzdbhE.png"
                                  />
                              </span>
                            </h5>
                            <h3>{sheets.length}</h3>
                          </div>
                          <div className="col s6">
                            <p>OtherStat</p>
                            <h5>1000</h5>
                          </div>
                          <div className="col s6">
                            <p>Tags</p>
                            <strong><h5>{mergedSheetsTags}</h5></strong>
                          </div>
                          <div className="col s6">
                            <p>Collaborators</p>
                            <strong><h5>{mergedSheetsCollabs}</h5></strong>
                          </div>

                      </div>
                      </div>
                    </a>
                  </div>

                  <div className="col s12 m6 l3">
                    <a href="/vault">
                    <div className="appPage small">
                      <div className="row">
                          <div className="col s12">
                            <h5>Files
                              <span>
                                <img
                                  alt="Vault"
                                  className="vaultIcon"
                                  src="https://i.imgur.com/9ZlABws.png"
                                  />
                              </span>
                            </h5>
                            <h3>{files.length}</h3>
                          </div>
                          <div className="col s6">
                            <p>Types</p>
                            <strong><h5>{fileTypesCount}</h5></strong>
                          </div>
                          <div className="col s6">
                            <p>Tags</p>
                            <strong><h5>{mergedFilesTags}</h5></strong>
                          </div>
                          <div className="col s6">
                            <p>Collaborators</p>
                            <strong><h5>{mergedFilesCollabs}</h5></strong>
                          </div>

                      </div>
                      </div>
                    </a>
                  </div>

                  <div className="col s12 m6 l3">
                    <a href="/contacts">
                    <div className="appPage">
                      <div className="row">

                          <div className="col s12">
                              <h5>Contacts
                                <span>
                                  <img
                                    alt="Contacts"
                                    className="appPageIcons"
                                    src="https://i.imgur.com/st3JArl.png"
                                    />
                                </span>
                              </h5>
                            <h3>{contacts.length}</h3>
                          </div>
                          <div className="col s6">
                            <p>OtherStat</p>
                            <h5>523</h5>
                          </div>
                          <div className="col s6">
                            <p>Types</p>
                            <h5>{mergedContactsTypes}</h5>
                          </div>
                          <div className="col s6">
                            <p>OtherState2</p>
                            <h5>{mergedFilesCollabs}</h5>
                          </div>

                      </div>
                      </div>
                    </a>
                  </div>
                  <div className="allFilesTable">
                  <h6>Opened Recently <span>({recentFiles.length})</span></h6>
                  <table className="bordered">
                    <thead>
                      <tr>
                          <th>Name</th>
                          <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                    {
                      recentFiles.map(merge => {
                        var link;
                        var name;
                        var date;
                        if(merge.title) {
                          name = merge.title;
                        } else {
                          name = merge.name;
                        }
                        if(merge.updated) {
                          date = merge.updated;
                        } else {
                          date = merge.uploaded;
                        }
                        if(merge.fileType === "documents") {
                          link = '/documents/doc/' + merge.id;
                        } else if(merge.fileType === "sheets") {
                          link = '/sheets/sheet/' + merge.id;
                        } else if(merge.fileType === "vault") {
                          link = '/vault/' + merge.id;
                        } else {
                          link = '#';
                        }
                      return(
                        <tr key={merge.id}>
                          <td className="appTD"><a href={link}>{name}</a></td>
                          <td className="">{date}</td>
                        </tr>
                      );
                      })
                    }
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
