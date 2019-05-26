import React, { Component } from 'reactn';
import { Table } from 'semantic-ui-react';

class RoleTable extends Component {
  render() {
      return (
        <Table celled>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell>Admin</Table.HeaderCell>
                <Table.HeaderCell>Manager</Table.HeaderCell>
                <Table.HeaderCell>User</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body>
            <Table.Row>
                <Table.Cell>Make Payments</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Update Organization Information</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Delete Users From Organization</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Add New Teams</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Add New Team Members</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Delete Team Members From Teams</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Counts Against Plan User Count</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell></Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Create Team Documents</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Create Team Forms</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Create Individual Forms</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Share Team Files</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
                <Table.Cell>X</Table.Cell>
            </Table.Row>
            </Table.Body>
        </Table>
       );
  }
}

export default RoleTable;
