import React, { Component } from 'reactn';
import Nav from '../../shared/views/Nav';
import { Container, Input, Grid, Table, Icon } from 'semantic-ui-react';

class Skeleton extends Component {
  render() {
      return (
        <div>
            <Nav />
                <Container className='margin-top-65'>
                    <Grid stackable columns={2}>
                        <Grid.Column>
                        <h2>Documents (...)
                        </h2>
                        </Grid.Column>
                        <Grid.Column>
                            <Input icon='search' className='search-box'/>
                        </Grid.Column>
                    </Grid>
                    <Table unstackable style={{borderRadius: "0"}}>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                            <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Collaborators</Table.HeaderCell>
                            <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Updated</Table.HeaderCell>
                            <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Tags</Table.HeaderCell>
                            <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
        
                        <Table.Body>
                        
                            <Table.Row>
                                <Table.Cell><div className='blue-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell>
                                    <Icon name='ellipsis vertical' className='actions' />
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell><div className='blue-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell>
                                    <Icon name='ellipsis vertical' className='actions' />
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell><div className='blue-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell>
                                    <Icon name='ellipsis vertical' className='actions' />
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell><div className='blue-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell>
                                    <Icon name='ellipsis vertical' className='actions' />
                                </Table.Cell>
                            </Table.Row>

                            <Table.Row>
                                <Table.Cell><div className='blue-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell><div className='grey-skel-div'></div></Table.Cell>
                                <Table.Cell>
                                    <Icon name='ellipsis vertical' className='actions' />
                                </Table.Cell>
                            </Table.Row>
                            
                        </Table.Body>
                    </Table>
                    <div className='grey-skel-div' style={{float: "right", marginBottom: "25px"}}>
                      
                    
                    </div>
                </Container>
                
        </div>
       );
  }
}

export default Skeleton;
