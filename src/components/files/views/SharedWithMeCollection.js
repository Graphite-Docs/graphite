import React, { Component } from 'reactn';
import { Link } from 'react-router-dom';
import { Table, Menu } from 'semantic-ui-react';
const vault = require('../helpers/vault');

class SharedWithMeCollection extends Component {
  render() {
      const { sharedFiles, filesPerPage, sharedCollectionLoading } = this.global;
      const { indexOfFirstFile, indexOfLastFile } = this.props;
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(sharedFiles.length / filesPerPage); i++) {
          pageNumbers.push(i);
      }
  
      const renderPageNumbers = pageNumbers.map(number => {
        return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => vault.handlePageChange(number)} />
        );
      });
      if(sharedCollectionLoading) {
        return (
            <div className="margin-top-20 center">
                <h3>Loading all your shared files...</h3>
            </div>
        )
      } else {
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
                    sharedFiles.slice(indexOfFirstFile, indexOfLastFile).map(file => {
                    return(
                    <Table.Row key={file.id}>
                        <Table.Cell><Link to={'/shared/files/fileInfo&user=' + file.sharedBy + '&id=' + file.id}>{file.name ? file.name.length > 20 ? file.name.substring(0,20)+"..." :  file.name : "Untitled"} </Link></Table.Cell>
                        <Table.Cell>{file.sharedBy}</Table.Cell>
                        <Table.Cell>{file.dateShared}</Table.Cell>
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
                <label>Files per page</label>
                <span className="custom-dropdown small">
                <select className="ui selection dropdown custom-dropdown" onChange={vault.setPagination}>
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

export default SharedWithMeCollection;
