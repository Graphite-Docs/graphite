import React, { Component } from "react";
// import 'react-quill/dist/quill.snow.css';
import {
  getFile,
  putFile
} from 'blockstack';

export default class SingleProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeline: {
        "title": {
          "media": {
            "url": "",
            "caption": "",
            "credit": ""
          },
          "text": {
            "headline": "",
            "text": ""
          }
        },
        "events": []
      },
      timelineModal: "hide",
      eventsUpdate: [],
      addToProjectModal: "hide",
      collabModal: "hide",
      timelineComment: "",
      commentTitle: "",
    }
    this.setTimeline = this.setTimeline.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleCommentTitleChange = this.handleCommentTitleChange.bind(this);
    this.addComment = this.addComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
  }



  componentDidMount() {
    const file = this.props.match.params.id;
    const fullFile = 'projects/' + file + '.json'

    getFile(fullFile, {decrypt: true})
     .then((fileContents) => {
       if(JSON.parse(fileContents || '{}').timeline) {
         this.setState({timeline: JSON.parse(fileContents || '{}').timeline});
       } else {
         const titleObject = {};
         titleObject.media = {};
         titleObject.media.url = "";
         titleObject.media.caption = "";
         titleObject.media.credit = "";
         titleObject.text = {};
         titleObject.text.headline = JSON.parse(fileContents || '{}').title;
         titleObject.text.text = JSON.parse(fileContents || '{}').topic;
         const eventsObject = {};
         eventsObject.media = {};
         eventsObject.media.url = "";
         eventsObject.media.caption = "";
         eventsObject.media.credit = "";
         eventsObject.start_date = {};
         eventsObject.start_date.month = parseInt(JSON.parse(fileContents || '{}').createdMonth, 10);
         eventsObject.start_date.day = parseInt(JSON.parse(fileContents || '{}').createdDay, 10);
         eventsObject.start_date.year = parseInt(JSON.parse(fileContents || '{}').createdYear, 10);
         eventsObject.text = {};
         eventsObject.text.headline = "Project created";
         eventsObject.text.text = "Project created with the following tag(s):  " + JSON.parse(fileContents || '{}').tags;
         const eventTimelineObject = [...this.state.timeline.events, eventsObject];
         const timelineObject = {};
         timelineObject.title = titleObject;
         timelineObject.events = eventTimelineObject;
         this.setState({timeline: timelineObject, eventsUpdate: eventTimelineObject});
       }
     })
      .then(() => {
        this.setTimeline();
      })
      .catch(error => {
        console.log(error);
      });
  }


  setTimeline() {
    window.timeline = new window.TL.Timeline('timeline-embed',
        this.state.timeline, {debug: true});
  }

  handleTitleChange(e) {
    console.log(e.target.value);
  }

  handleCommentChange(e) {
    this.setState({ timelineComment: e.target.value });
  }

  handleCommentTitleChange(e) {
    this.setState({ commentTitle: e.target.value });
  }

  addComment() {
    const titleObject = this.state.timeline.title;
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const eventObject = {};
    eventObject.media = {};
    eventObject.media.url = "";
    eventObject.media.caption = "";
    eventObject.media.credit = "";
    eventObject.start_date = {};
    eventObject.start_date.month = parseInt(month, 10);
    eventObject.start_date.day = parseInt(day, 10);
    eventObject.start_date.year = parseInt(year, 10);
    eventObject.text = {};
    eventObject.text.headline = this.state.commentTitle;
    eventObject.text.text = this.state.timelineComment;
    const eventTimelineObject = [...this.state.timeline.events, eventObject];
    const timelineObject = {};
    timelineObject.title = titleObject;
    timelineObject.events = eventTimelineObject;
    this.setState({timeline: timelineObject});
    // setTimeout(this.setTimeline, 500);
    // setTimeout(this.saveComment, 500);
  }

  saveComment() {
    const file = this.props.match.params.id;
    const fullFile = 'projects/' + file + '.json'
    putFile(fullFile, JSON.stringify(this.state), {encrypt: true})
    .then(() => {
        this.setState({ commentTitle: "", timelineComment: "", timelineModal: "hide"});
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderView() {
    return (
        <div>
          <div className="navbar-fixed toolbar">
            <nav className="toolbar-nav">
              <div className="nav-wrapper">
                <a href="/projects" className="left brand-logo"><i className="small-brand material-icons">arrow_back</i></a>

                  <ul className="left toolbar-menu">
                  <li><input className="print-title small-menu" placeholder="Title" type="text" value="Heyo" onChange={this.handleTitleChange} /></li>
                  <li><a className="small-menu">Export Options</a></li>
                  {/*}<li><a className="small-menu stealthy-logo" ><img className="stealthylogo" src="https://www.stealthy.im/c475af8f31e17be88108057f30fa10f4.png" alt="open stealthy chat"/></a></li>*/}
                  </ul>

              </div>
            </nav>
          </div>


        </div>
      );
  }

  render() {
    const { timelineModal } = this.state;
    console.log(this.state.timeline.events);
    console.log(this.state.eventsUpdate);
    return (
      <div>
        {this.renderView()}
        <div className="main-content">
          <h3 className="center-align">File Timeline</h3>
          <div aria-labelledby="Project timeline" id='timeline-embed'></div>
          <h3 className="center-align">Notes</h3>
          <div className="container">
          <table className="bordered">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Note</th>
                <th>Name</th>
                <th>Signature Key</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4/10/2017</td>
                <td>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</td>
                <td>Carla Rodriguez</td>
                <td>173894ehrt84028dhs49568261hgkdurh</td>
              </tr>
            </tbody>
          </table>
          </div>
          {/*Project Control Button */}
          <div aria-labelledby="Project actions menu" className="fixed-action-btn horizontal click-to-toggle">
            <a className="btn-floating btn-large black">
              <i className="material-icons">menu</i>
            </a>
            <ul aria-labelledby="project actions">
              <li aria-labelledby="project button"><a onClick={() => this.setState({ timelineModal: "" })} className="btn-floating red"><i aria-labelledby="Add to timeline" className="material-icons">add</i></a></li>
              <li aria-labelledby="project button"><a onClick={() => this.setState({addToProjectModal: ""})} className="btn-floating green"><i aria-labelledby="Upload to project" className="material-icons">publish</i></a></li>
              <li aria-labelledby="project button"><a onClick={() => this.setState({collabModal: ""})} className="btn-floating blue"><i aria-labelledby="Add collaborator" className="material-icons">people</i></a></li>
            </ul>
          </div>
          {/* End Project Control Button */}

          {/* Timeline Modal */}
          <div className={timelineModal}>
            <div className="project-page-modal modal">
              <div className="modal-content">
                <h4>Add to Timeline</h4>
                <p>Add details about the project to the project timeline.</p>
                <input value={this.state.commentTitle} type="text" onChange={this.handleCommentTitleChange} />
                <textarea value={this.state.timelineComment} onChange={this.handleCommentChange} id="textarea1" className="materialize-textarea"></textarea>
              </div>
              <div className="modal-footer">
                <a onClick={this.addComment} className="modal-action modal-close waves-effect waves-green btn-flat">Add Comment</a>
                <a onClick={() => this.setState({ timelineModal: "hide" })} className="modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
              </div>
            </div>
          </div>
          {/* End Timeline Modal */}
        </div>
      </div>
    );
  }
}
