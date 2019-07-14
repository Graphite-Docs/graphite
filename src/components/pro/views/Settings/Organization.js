import React, { Component, setGlobal } from 'reactn';
import { Container, Grid, Table, Icon, Modal, Input, Button } from 'semantic-ui-react';
const account = require('../../helpers/account');

class Organization extends Component {
  render() {
    const { proOrgInfo, orgNameModalOpen, userSession } = this.global;
    const thisUser = proOrgInfo.users.filter(users => users.username === userSession.loadUserData().username)[0];
    let payments;
    if(thisUser) {
      if(thisUser.isAdmin) {
        if(proOrgInfo.accountPlan.paymentHistory.length > 0) {
          payments = proOrgInfo.accountPlan.paymentHistory;
        } else {
          payments = [];
        }
      } else {
        payments = [];
      }
    }

      return (
        <div>
            <Container>
                <div className="padding-top-30">
                    <div className="table-container">
                        <Grid stackable columns={1}>
                            <Grid.Column>
                              <h2>Organization</h2>
                            </Grid.Column>
                        </Grid>
                        <Grid stackable columns={2}>
                            <Grid.Column>
                              <h5>Organization Name</h5>
                              <p>{proOrgInfo.name} 
                              {
                                thisUser ? 
                                <Modal 
                                open={orgNameModalOpen}
                                onClose={() => setGlobal({ orgNameModalOpen: false})}
                                closeIcon
                                trigger={<Icon onClick={() => setGlobal({orgNameModalOpen: true})} style={{cursor: "pointer", marginLeft: "10px"}} name="edit"/>}>
                                <Modal.Content>
                                  <Modal.Description>
                                    <h3>Update Organization Name</h3>
                                    <Input type="text" onChange={account.handleOrgName} />
                                  </Modal.Description>
                                  <Button onClick={account.saveOrgDetails} className="margin-top-10" secondary>Save</Button>
                                </Modal.Content>
                              </Modal>
                                :
                                <span className="hide" />
                              }
                              </p>
                            </Grid.Column>
                            <Grid.Column>
                              <h5>Account Plan</h5>
                              {proOrgInfo.accountPlan.planType === "Trial" ? <p className="margin-top-10">Trial ({`${((proOrgInfo.accountPlan.trialEnd - proOrgInfo.accountPlan.timestamp)/1000/60/60/24).toFixed(0)} days left`})</p> : <p className="margin-top-10">{proOrgInfo.accountPlan.planType}</p> }
                            </Grid.Column>
                        </Grid>
                        {
                          thisUser ?
                          <Grid stackable columns={1}>
                            <Grid.Column>
                              <h5>Billing History</h5>
                              <Table>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Date</Table.HeaderCell>
                                        <Table.HeaderCell>Amount</Table.HeaderCell>
                                        <Table.HeaderCell>Receipt</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {
                                        payments.map(a => {
                                            return (
                                                <Table.Row key={a.id}>
                                                    <Table.Cell>{a.date}</Table.Cell>
                                                    <Table.Cell>{a.amount}</Table.Cell>
                                                    <Table.Cell><Icon name="download" /></Table.Cell>
                                                </Table.Row>
                                            )
                                        })
                                    }
                                </Table.Body>
                            </Table>
                            </Grid.Column>
                        </Grid> : 
                        <Grid stackable columns={1}>
                          <Grid.Column>
                            <h5>Billing History Available to Admins Only</h5>
                          </Grid.Column>
                        </Grid>
                        }
                    </div>
                </div>
            </Container>
        </div>
       );
  }
}

export default Organization;
