import React, { Component } from 'reactn';
import { Button, Table, Icon, Modal, Menu } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
const forms = require('../helpers/forms');

class TeamForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
        visible: false,
        open: false,
        form: {}, 
    }
  }
  handleDelete = () => {
    let form = this.state.form;
    forms.deleteTeamForm(form);
    this.setState({ open: false });
  }

  render() {
      const { teamForms, pageNumbers, renderPageNumbers } = this.props;
      return (
        <div>
         <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Created</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Team</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {
              teamForms.map(form => {
              
              return(
                <Table.Row key={form.id} style={{ marginTop: "35px"}}>
                  <Table.Cell><Link to={`/team/${form.teamId}/forms/${form.id}`}>{form.title ? form.title : "Untitled"}</Link></Table.Cell>
                  <Table.Cell>{form.created}</Table.Cell>
                  <Table.Cell>{form.teamName}</Table.Cell>
                  <Table.Cell>
                      <Modal open={this.state.open} trigger={
                        <button className="link-button" onClick={() => this.setState({ open: true, form: form })} to={'/forms'} style={{color: "red"}}><Icon name='trash alternate outline'/>Delete</button>
                      } basic size='small'>
                        <SemanticHeader icon='trash alternate outline' content={this.state.form.title ? 'Delete ' + this.state.form.title + '?' : 'Delete form?'} />
                        <Modal.Content>
                          <p>
                            The form cannot be restored.
                          </p>
                        </Modal.Content>
                        <Modal.Actions>
                          <div>
                            <div>
                              <Button onClick={() => this.setState({ open: false })} basic color='red' inverted>
                                No
                              </Button>
                              <Button onClick={() => this.handleDelete(form)} color='red' inverted>
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Modal.Actions>
                      </Modal>
                  </Table.Cell>
                </Table.Row>
              );
              })
            }
          </Table.Body>
        </Table>
          <div>
          {
            pageNumbers.length > 0 ?
            <div style={{textAlign: "center"}}>
            <Menu pagination>
            {renderPageNumbers}
            </Menu>
            </div> :
            <div />
          }
          <div style={{float: "right", marginBottom: "25px"}}>
              <label>Forms per page</label>
              <span className="custom-dropdown small">
              <select className="ui selection dropdown custom-dropdown" onChange={forms.setFormsPages}>
              <option value={10}>
              10
              </option>
              <option value={20}>
              20
              </option>
              <option  value={50}>
              50
              </option>
          </select>
          </span>
          </div>
          </div>
        </div>
       );
  }
}

export default TeamForms;
