import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import Loading from '../Loading';
import { Table, Dropdown, Container, Icon, Grid, Modal, Button, Input } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';

export default class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mateInfo: "",
      modalOpen: false
    }
  }

  componentDidMount() {
    //TODO: This is where we'd need to load some pointer file from the shared hub that determine's the user's access.
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
    const { loading, teams, newTeamName } = this.props;
    let teamList;
    teams === undefined ? teamList = [] : teamList = teams;
      if(!loading) {
        return (
          <div>
          <div>
          <Header
            handleSignOut={this.props.handleSignOut}
           />
          <Container style={{marginTop: "45px"}}>
            <div className="center-align">
              <div className="row account-settings">
                <Grid stackable columns={2} style={{marginBottom: "15px"}}>
                  <Grid.Column><h2>Your Teams ({teamList.length})
                      <Modal
                        closeIcon
                        style={{borderRadius: "0"}}
                        open={this.state.modalOpen}
                        onClose={this.handleClose}
                        trigger={<Button onClick={this.handleOpen} style={{borderRadius: "0", marginLeft: "10px"}} secondary>Add New Team</Button>}
                        >
                        <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Add New Team</Modal.Header>
                        <Modal.Content>
                          <Modal.Description style={{maxWidth: "75%", margin: "auto"}}>
                          <div style={{marginBottom: "10px"}}>
                            <Input style={{marginRight: "15px"}} value={newTeamName} onChange={this.props.handleTeamNameChange} placeholder="HR" />
                            <label className="active">Team Name<span className="red-text">*</span></label>
                          </div>
                          <Button secondary style={{borderRadius: "0"}} onClick={() => this.handleClose('save')}>Save Team</Button>
                          <Button style={{borderRadius: "0"}} onClick={() => this.handleClose('cancel')}>Cancel</Button>
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                    </h2>
                  </Grid.Column>
                </Grid>
                <div className="col s12">
                <div className="col s12 account-settings-section">

                <Table unstackable style={{borderRadius: "0"}}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Team Name</Table.HeaderCell>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Created Date</Table.HeaderCell>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Member Count</Table.HeaderCell>
                      <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {
                      teamList.slice(0).map(team => {
                      return(
                        <Table.Row key={team.id} style={{ marginTop: "35px"}}>
                          <Table.Cell><a href={'/teams/' + team.id}>{team.name}</a></Table.Cell>
                          <Table.Cell>{team.createdDate}</Table.Cell>
                          <Table.Cell>{team.memberCount}</Table.Cell>
                          <Table.Cell>
                            <Dropdown icon='ellipsis vertical' className='actions'>
                              <Dropdown.Menu>
                                <Dropdown.Item>
                                  <Modal closeIcon trigger={<Link to={'/settings'} style={{color: "#282828"}}><Icon name='linkify'/>Invite Link</Link>}>
                                    <Modal.Header>Manage Tags</Modal.Header>
                                    <Modal.Content>
                                      <Modal.Description>
                                        <h3><Input value="" id='inviteLink' /> <a onClick={this.copyLink}><Icon name='copy outline' /></a></h3>
                                      </Modal.Description>
                                    </Modal.Content>
                                  </Modal>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item>
                                  <Modal open={this.state.open} trigger={
                                    <a style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</a>
                                  } basic size='small'>
                                    <SemanticHeader icon='trash alternate outline' content={team.name ? 'Delete ' + team.name + '?' : 'Delete team?'} />
                                    <Modal.Content>
                                      <p>
                                        Deleting a team removes access.
                                      </p>
                                    </Modal.Content>
                                    <Modal.Actions>
                                      <div>
                                        {
                                          this.state.loading ?
                                          <Loading style={{bottom: "0"}} /> :
                                          <div>
                                            <Button onClick={() => this.setState({ open: false })} basic color='red' inverted>
                                              <Icon name='remove' /> No
                                            </Button>
                                            <Button onClick={() => this.props.teammateToDelete(team)} color='red' inverted>
                                              <Icon name='checkmark' /> Delete
                                            </Button>
                                          </div>
                                        }
                                      </div>
                                    </Modal.Actions>
                                  </Modal>
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </Table.Cell>
                        </Table.Row>
                      );
                      })
                    }
                  </Table.Body>
                </Table>
                </div>
                </div>
              </div>
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
