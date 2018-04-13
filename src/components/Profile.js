import React, { Component } from 'react';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
} from 'blockstack';
import {Bar} from 'react-chartjs-2';
import {Line} from 'react-chartjs-2';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      value: []
  	};
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
    getFile("documents.json", {decrypt: true})
     .then((fileContents) => {
        this.setState({ value: JSON.parse(fileContents || '{}').value })
     })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    const value = this.state.value;
    const words = value.reduce(function(prevVal, elem) {
      return prevVal + elem.words;
    }, 0);
    const docArray = value.map(function(doc) {
      return doc.title;
    })
    const wordsArray = value.map(function(doc) {
      return doc.words;
    })
    const dateArray = value.map(function(doc) {
      return doc.updated;
    })
    const data = {
      labels: docArray,
      datasets: [
        {
          label: 'Word Count',
          backgroundColor: 'rgba(136,148,237,0.2)',
          borderColor: 'rgba(136,148,237,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(136,148,237,0.2)',
          hoverBorderColor: 'rgba(136,148,237,1)',
          data: wordsArray
        }
      ]
    };

    const lineData = {
      labels: dateArray,
      datasets: [
        {
          label: 'Words',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: wordsArray
        }
      ]
    };

    const { person } = this.state;
    console.log(words);
    return (
      !isSignInPending() ?
      <div className="container" id="section-2">
      <div className="center-align">
        <h3>Hello, <span id="heading-name">{ person.name() ? person.name() : 'Nameless Person' }</span>!</h3>
        <h4>Check out your stats</h4>
        <div className="row">
          <div className="col s12 m6">
            <div className="profile-stats hoverable card">
              <p className="stats">{words}</p>
              <h5 className="muted">Total Words Written</h5>
            </div>
          </div>
          <div className="col s12 m6">
            <div className="profile-stats hoverable card">
              <p className="stats">{docArray.length}</p>
              <h5 className="muted">Total Documents Created</h5>
            </div>
          </div>
          <div className="col s12">
            <div className="profile-stats hoverable card">
              <h5 className="muted">Words Per Document</h5>
              <Bar
                data={data}
              />
            </div>
          </div>
          <div className="col s12">
            <div className="profile-stats hoverable card">
            <h5 className="muted">Words By Date</h5>
              <Line data={lineData} />
            </div>
          </div>
        </div>
      </div>
      </div> : null
    );
  }
}
