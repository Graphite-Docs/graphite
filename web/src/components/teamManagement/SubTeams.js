import React, { Component } from 'react';
import Header from '../Header';
import Loading from '../Loading';
import People from './People';
import { Container } from 'semantic-ui-react';

export default class SubTeams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mateInfo: "",
      modalOpen: false
    }
  }

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = (props) => this.setState({ modalOpen: false }, () => {
    if(props === 'cancel') {
      this.props.clearNewTeammate();
    } else if(props === 'save') {
      this.props.saveNewTeamInfo();
    }

  })

  copyLink = (link) => {
    /* Get the text field */
    var copyText = document.getElementById("inviteLink");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    alert(copyText.value);

  }

  render() {
    // this.state.mateInfo !=="" ? window.$('#modal4').modal('open') : window.$('#modal4').modal('close');
    const { loading } = this.props;
      if(!loading) {
        return (
          <div>
          <div>
          <Header
            handleSignOut={this.props.handleSignOut}
           />
          <Container style={{marginTop: "45px"}}>
          <div className="col s12 account-settings-section">
            <People
              peopleList = {this.props.peopleList}
              createMember={this.props.createMember}
            />
          </div>
          </Container>
          </div>

          </div>
        );
      } else {
        return (
          <div>
            <Loading />
          </div>
        );
      }
  }
}
