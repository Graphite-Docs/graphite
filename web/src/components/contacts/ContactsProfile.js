import React, { Component } from "react";
import { Link } from 'react-router-dom';


export default class ContactsProfile extends Component {

componentDidMount() {
  this.props.profileLoad();
}

render() {
  return (
    <div>
    <div className="navbar-fixed toolbar">
      <nav className="toolbar-nav">
        <div className="nav-wrapper">
          <a href="/contacts" className="left brand-logo"><i className="material-icons">arrow_back</i></a>


            <ul className="left toolbar-menu">
              <li><a href='/contacts'>Back to Contacts</a></li>
            </ul>

        </div>
      </nav>
    </div>
    <div className="container docs contact-page">

    <div className="col s12 m7">
    <div className="card medium contact-profile-card horizontal">
      <div className="card-image profile-image">
        <img className="rounded-img responsive-img" alt="state img" src={this.props.img} />
      </div>
      <div className="card-stacked">
        <div className="card-content">
          <h3 className="header">{this.props.name}</h3>
          <h5>{this.props.username}</h5>
          <p>{this.props.description}</p>
        </div>
        <div className="card-action">
          <Link to={'/documents/shared/' + this.props.username}><img src="https://i.imgur.com/C71m2Zs.png" alt="documents-icon" className="dropdown-icon" /></Link>
          <Link to={'/sheets/shared/' + this.props.username}><img src="https://i.imgur.com/6jzdbhE.png" alt="sheets-icon" className="dropdown-icon-bigger" /></Link>
        </div>
      </div>
    </div>
  </div>
    </div>
    </div>
  );
}
}

// <input type="text" placeholder="Message here" value={this.state.newMessage} onChange={this.handleMessage} />
