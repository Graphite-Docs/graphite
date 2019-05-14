import React, { Component } from 'reactn';
import { Table, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
const gdocs = require('../helpers/documents');

class TeamDocs extends Component {
  render() {
      const { currentPage, docsPerPage, teamDocs, teamCollectionLoading } = this.global;
      const indexOfLastDoc = currentPage * docsPerPage;
      const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(teamDocs.length / docsPerPage); i++) {
          pageNumbers.push(i);
      }
  
      const renderPageNumbers = pageNumbers.map(number => {
        return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => gdocs.handlePageChange(number)} />
        );
      });

      if(teamCollectionLoading) {
        return (
            <div className="margin-top-20 center">
                <h3>Loading all your team docs...</h3>
            </div>
        )
      } else {
        return (
            <div>
            <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Team</Table.HeaderCell>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Updated</Table.HeaderCell>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                </Table.Row>
                </Table.Header>
    
                <Table.Body>
                {
                    teamDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
                    return(
                    <Table.Row key={doc.id}>
                        <Table.Cell><Link to={`/documents/team/${doc.teamId}/${doc.id}`}>{doc.title}</Link></Table.Cell>
                        <Table.Cell>{doc.teamName}</Table.Cell>
                        <Table.Cell>{doc.lastUpdated}</Table.Cell>
                    </Table.Row>
                    );
                    })
                }
                </Table.Body>
            </Table>
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
                <label>Docs per page</label>
                <span className="custom-dropdown small">
                <select className="ui selection dropdown custom-dropdown" value={this.global.docsPerPage} onChange={gdocs.setDocsPerPage}>
                <option value={10}>
                10
                </option>
                <option value={20}>
                20
                </option>
                <option value={50}>
                50
                </option>
            </select>
            </span>
            </div>
            </div>
           );
      }
  }
}

export default TeamDocs;