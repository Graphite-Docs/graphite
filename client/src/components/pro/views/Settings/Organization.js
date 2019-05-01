import React, { Component, setGlobal } from 'reactn';
import { Container, Grid, Table, Icon, Modal, Input, Button } from 'semantic-ui-react';
const account = require('../../helpers/account');

class Organization extends Component {
  render() {
    const { proOrgInfo, orgNameModalOpen } = this.global;
    let payments;
    if(proOrgInfo.paymentInfo.paymentHistory.length > 0) {
      payments = proOrgInfo.paymentInfo.paymentHistory;
    } else {
      payments = [];
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
                              <p>{proOrgInfo.orgName} 
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
                              </p>
                            </Grid.Column>
                            <Grid.Column>
                              <h5>Account Plan</h5>
                              {proOrgInfo.trialAccount.onTrial ? <p className="margin-top-10">Trial ({`${((proOrgInfo.trialAccount.trialEnd - proOrgInfo.trialAccount.timestamp)/1000/60/60/24).toFixed(0)} days left`})</p> : <p className="margin-top-10">{proOrgInfo.accountPlan}</p> }
                            </Grid.Column>
                        </Grid>
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
                        </Grid>
                    </div>
                </div>
            </Container>
        </div>
       );
  }
}

export default Organization;
