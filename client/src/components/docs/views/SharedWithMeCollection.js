import React, { Component } from 'reactn';
import { Table, Icon, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
const gdocs = require('../helpers/documents');

class SharedWithMe extends Component {
  render() {
      let sharedDocs = [];
      let indexOfFirstDoc;
      let indexOfLastDoc;
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(sharedDocs.length / this.global.docsPerPage); i++) {
          pageNumbers.push(i);
      }
  
      const renderPageNumbers = pageNumbers.map(number => {
        return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => gdocs.handlePageChange(number)} />
        );
      });
      return (
        <div>
        <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Title</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Shared By</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Shared</Table.HeaderCell>
                <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body>
            {
                sharedDocs.slice(indexOfFirstDoc, indexOfLastDoc).map(doc => {
                return(
                <Table.Row key={doc.id}>
                    <Table.Cell><Link to={'/documents/' + doc.id}>{doc.title ? doc.title.length > 20 ? doc.title.substring(0,20)+"..." :  doc.title : "Untitled"} <span>{doc.singleDocIsPublic ? <Icon name='globe' /> : <Icon name='lock' />}</span></Link></Table.Cell>
                    <Table.Cell>{doc.sharedBy}</Table.Cell>
                    <Table.Cell>{doc.date}</Table.Cell>
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

export default SharedWithMe;