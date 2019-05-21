import React, { Component, setGlobal } from 'reactn';
import { Input, Button, Table, Icon, Dropdown, Modal, Menu, Label } from 'semantic-ui-react';
import {Header as SemanticHeader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { ToastsStore} from 'react-toasts';
const forms = require('../helpers/forms');
const formTags = require('../helpers/formTags');

class MyForms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            open: false,
            form: {},
            onboarding: false,
            run: false
        }
    }

    tagModal = (file) => {
        setGlobal({tagModalOpen: true})
        formTags.loadSingleFormTags(file);
    }

    handleDelete = () => {
      this.setState({ open: false });
      let form = this.state.form;
      forms.handleDeleteFormItem(form)
    }

    copyLink = () => {
      /* Get the text field */
      var copyText = document.getElementById("copyLink");
      /* Select the text field */
      copyText.select();
  
      /* Copy the text inside the text field */
      document.execCommand("copy");
      ToastsStore.success(`Link copied`)
    }

  render() {
      const { currentForms, indexOfFirstForm, indexOfLastForm, pageNumbers, renderPageNumbers } = this.props;
      const { tag, tags, tagModalOpen } = this.global;
      let formTags;
      if(tags) {
          formTags = tags;
      } else {
          formTags = [];
      }

      return (
        <div>
         <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Created</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
              <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {
              currentForms.slice(indexOfFirstForm, indexOfLastForm).map(form => {
                var tags;
                if(form.tags) {
                  tags = Array.prototype.slice.call(form.tags);
                } else {
                  tags = [];
                }

              return(
                <Table.Row key={form.id} style={{ marginTop: "35px"}}>
                  <Table.Cell><Link to={'/forms/' + form.id}>{form.title ? form.title.length > 20 ? form.title.substring(0,20)+"..." :  form.title : "Untitled"}</Link></Table.Cell>
                  <Table.Cell>{form.created}</Table.Cell>
                  <Table.Cell>{tags === [] ? tags : tags.join(', ')}</Table.Cell>
                  <Table.Cell>
                    <Dropdown icon='ellipsis vertical' className='actions'>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <Modal 
                            closeIcon 
                            trigger={<button className="link-button" onClick={() => this.tagModal(form)} style={{color: "#282828"}}><Icon name='tag'/>Tag</button>}
                            open={tagModalOpen}
                            onClose={() => setGlobal({tagModalOpen: false})}
                            >
                            <Modal.Header>Manage Tags</Modal.Header>
                            <Modal.Content>
                              <Modal.Description>
                              <Input placeholder='Type a tag...' value={tag} onKeyUp={formTags.checkKey} onChange={formTags.setFormTags} />
                              <Button onClick={() => formTags.addFormTagManual(form, 'forms')} style={{borderRadius: "0"}}>Add Tag</Button><br/>
                              {
                                formTags.slice(0).reverse().map(tag => {
                                  return (
                                    <Label style={{marginTop: "10px"}} key={tag} as='a' tag>
                                      {tag}
                                      <Icon onClick={() => formTags.deleteFormTag(tag, 'vault')} name='delete' />
                                    </Label>
                                  )
                                })
                              }
                              <div>
                                <Button style={{background: "#282828", color: "#fff", borderRadius: "0", marginTop: "15px"}} onClick={() => formTags.saveTags(form)}>Save Tags</Button>
                              </div>
                              </Modal.Description>
                            </Modal.Content>
                          </Modal>
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>
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
                                  <Button onClick={this.handleDelete} color='red' inverted>
                                    Delete
                                  </Button>
                                </div>
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

export default MyForms;
