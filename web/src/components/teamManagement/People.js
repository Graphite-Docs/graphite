import React, { Component } from "react";
import { Link } from "react-router-dom";
import initialTeam from './testTeam.json';
import {
  Table,
  Dropdown,
  Container,
  Icon,
  Grid,
  Modal,
  Button,
  Input
} from "semantic-ui-react";
import Loading from '../shared/Loading';
import { Header as SemanticHeader } from "semantic-ui-react";

export default class People extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mateInfo: "",
      modalOpen: false,
      memberList: initialTeam.members,
      memberName: "",
      role: ""
    }
  }

  componentDidMount() {
    //Something Here
  }

  handleChange = (e, { value }) => this.setState({ value })
  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = (props) => this.setState({ modalOpen: false }, () => {
    if(props === 'cancel') {
      this.setState({memberName: "", role: "" })
    } else if(props === 'save') {
      if(!this.state.memberName || !this.state.role) {
        alert("Make sure to select a person and role.")
      } else {
        // let memberName = this.state.memberName;
        const object = {
          memberName: this.state.memberName,
          memberRole: this.state.role
        }
        let team = window.location.href.split('teams/')[1].split('/')[0];
        this.props.createMember(object, team);
        this.setState({ memberName: "" })
      }
    }

  })

  selectMember = (member) => {
    this.setState({ memberName: member })
  }

  render() {
    const { peopleList, team } = this.props;
    const { memberList, memberName, role } = this.state;
    let list;
    let members;

    if(peopleList) {
      list = peopleList;
    } else {
      list = [];
    }

    if(memberList) {
      members = memberList;
    } else {
      members = []
    }

    return (
      <div>
        <div>
          <Container style={{ marginTop: "45px" }}>
            <div className="center-align">
              <div className="row account-settings">
                <Grid stackable columns={2} style={{ marginBottom: "15px" }}>
                  <Grid.Column>
                    <h2>
                      Members ({list.length})
                      <Modal
                        style={{ borderRadius: "0" }}
                        open={this.state.modalOpen}
                        onClose={this.handleClose}
                        trigger={
                          <Button
                            onClick={this.handleOpen}
                            style={{ borderRadius: "0", marginLeft: "10px" }}
                            secondary
                          >
                            Add New Member
                          </Button>
                        }
                      >
                        <Modal.Header
                          style={{
                            fontFamily: "Muli, san-serif",
                            fontWeight: "200"
                          }}
                        >
                          Add New Member
                        </Modal.Header>
                        <Modal.Content>
                          <Modal.Description
                            style={{ maxWidth: "75%", margin: "auto" }}
                          >
                            <div style={{ marginBottom: "10px" }}>
                              <Dropdown
                                text={memberName ? memberName : "Choose a team member"}
                                style={{padding: "5px", border: "0.5px solid #eee", borderRadius: "5px"}}
                              >
                              <Dropdown.Menu style={{padding: "5px", marginBottom: "15px"}}>
                              {
                                members.map(person => {
                                  return (
                                    <a style={{cursor: "pointer"}} onClick={() => this.selectMember(person.name)}><Dropdown.Item key={person.name}>
                                      {person.name}
                                    </Dropdown.Item></a>
                                  )
                                })
                              }
                              </Dropdown.Menu>
                              </Dropdown>
                              <div style={{marginTop: "15px", marginBottom: "35px"}}>
                                <p>Set Role</p>
                                  {role === 'admin' ? <Button onClick={() => this.setState({ role: "admin" })} style={{background: "green", color: "#fff"}}>Administrator</Button> : <Button onClick={() => this.setState({ role: "admin" })}>Administrator</Button>}
                                  {role === 'user' ? <Button onClick={() => this.setState({ role: "user" })} style={{background: "green", color: "#fff"}}>User</Button> : <Button onClick={() => this.setState({ role: "user" })}>User</Button>}
                              </div>
                            </div>
                            <Button
                              secondary
                              style={{ borderRadius: "0" }}
                              onClick={() => this.handleClose("save")}
                            >
                              Save Member
                            </Button>
                            <Button
                              style={{ borderRadius: "0" }}
                              onClick={() => this.handleClose("cancel")}
                            >
                              Cancel
                            </Button>
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                    </h2>
                  </Grid.Column>
                </Grid>
                <div className="col s12">
                  <div className="col s12 account-settings-section">
                    <Table unstackable style={{ borderRadius: "0" }}>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell
                            style={{ borderRadius: "0", border: "none" }}
                          >
                            Member Name
                          </Table.HeaderCell>
                          <Table.HeaderCell
                            style={{ borderRadius: "0", border: "none" }}
                          >
                            Team Admin
                          </Table.HeaderCell>
                          <Table.HeaderCell
                            style={{ borderRadius: "0", border: "none" }}
                          />
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {list.slice(0).map(person => {
                          return (
                            <Table.Row
                              key={person.id}
                              style={{ marginTop: "35px" }}
                            >
                              <Table.Cell>{person.name}</Table.Cell>
                              <Table.Cell>{person.isAdmin}</Table.Cell>
                              <Table.Cell>
                                <Dropdown
                                  icon="ellipsis vertical"
                                  className="actions"
                                >
                                  <Dropdown.Menu>
                                    <Dropdown.Item>
                                      <Modal
                                        closeIcon
                                        trigger={
                                          <Link
                                            to={"/settings"}
                                            style={{ color: "#282828" }}
                                          >
                                            <Icon name="linkify" />Invite Link
                                          </Link>
                                        }
                                      >
                                        <Modal.Header>Manage Tags</Modal.Header>
                                        <Modal.Content>
                                          <Modal.Description>
                                            <h3>
                                              <Input value="" id="inviteLink" />{" "}
                                              <a onClick={this.copyLink}>
                                                <Icon name="copy outline" />
                                              </a>
                                            </h3>
                                          </Modal.Description>
                                        </Modal.Content>
                                      </Modal>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item>
                                      <Modal
                                        open={this.state.open}
                                        trigger={
                                          <a style={{ color: "red" }}>
                                            <Icon name="trash alternate outline" />Delete
                                          </a>
                                        }
                                        basic
                                        size="small"
                                      >
                                        <SemanticHeader
                                          icon="trash alternate outline"
                                          content={
                                            person.name ? (
                                              "Delete " + person.name + "?"
                                            ) : (
                                              "Delete team?"
                                            )
                                          }
                                        />
                                        <Modal.Content>
                                          <p>Deleting a team removes access.</p>
                                        </Modal.Content>
                                        <Modal.Actions>
                                          <div>
                                            {this.state.loading ? (
                                              <Loading
                                                style={{ bottom: "0" }}
                                              />
                                            ) : (
                                              <div>
                                                <Button
                                                  onClick={() =>
                                                    this.setState({
                                                      open: false
                                                    })}
                                                  basic
                                                  color="red"
                                                  inverted
                                                >
                                                  <Icon name="remove" /> No
                                                </Button>
                                                <Button
                                                  onClick={() =>
                                                    this.props.teammateToDelete(
                                                      team
                                                    )}
                                                  color="red"
                                                  inverted
                                                >
                                                  <Icon name="checkmark" />{" "}
                                                  Delete
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </Modal.Actions>
                                      </Modal>
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
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
  }
}
