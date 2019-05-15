import React, { Component } from 'reactn';
import { Table, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { deleteTeamFile } from '../../files/helpers/teamFiles';
const files = require('../helpers/vault');

class TeamFiles extends Component {
  render() {
      const { currentPage, filesPerPage, teamFiles, teamCollectionLoading, proOrgInfo, userSession } = this.global;
      const indexOfLastFile = currentPage * filesPerPage;
      const indexOfFirstFile = indexOfLastFile - filesPerPage;
      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(teamFiles.length / filesPerPage); i++) {
          pageNumbers.push(i);
      }
  
      const renderPageNumbers = pageNumbers.map(number => {
        return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => files.handlePageChange(number)} />
        );
      });

      if(teamCollectionLoading) {
        return (
            <div className="margin-top-20 center">
                <h3>Loading all your team files...</h3>
            </div>
        )
      } else {
        return (
            <div>
            <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Name</Table.HeaderCell>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Team</Table.HeaderCell>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Updated</Table.HeaderCell>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}></Table.HeaderCell>
                </Table.Row>
                </Table.Header>
    
                <Table.Body>
                {
                    teamFiles.slice(indexOfFirstFile, indexOfLastFile).map(file => {
                    const teams = proOrgInfo.teams;
                    const thisTeam = teams.filter(a => a.id === file.teamId)[0];
                    const users = thisTeam.users;
                    const thisUser = users.filter(a => a.username === userSession.loadUserData().username)[0];
                    const isAdminOrManager = thisUser.role === "Admin" || thisUser.role === "Manager" ? true : false;
                    return(
                    <Table.Row key={file.id}>
                        <Table.Cell><Link to={`/files/team/${file.teamId}/${file.id}`}>{file.name}</Link></Table.Cell>
                        <Table.Cell>{file.teamName}</Table.Cell>
                        <Table.Cell>{file.lastUpdated}</Table.Cell>
                        <Table.Cell>{isAdminOrManager ? <button onClick={() => deleteTeamFile({teamId: file.teamId, docId: file.id})} className="link-button" style={{color: "red"}}>Delete</button> : <span className="hide" />}</Table.Cell>
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
                <select className="ui selection dropdown custom-dropdown" onChange={files.setFilesPerPage}>
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

export default TeamFiles;