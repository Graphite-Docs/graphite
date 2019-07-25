import React, { Component } from 'reactn';
import { Table, Button, Icon } from 'semantic-ui-react';
import { downloadResponses, loadForm } from '../helpers/singleForm';

class Responses extends Component {
  download = () => {
    const { formResponses, userSession, singleForm, teamKeys } = this.global;
    let decryptedResponses = [];
    const fields = singleForm.questions.map(a => a.text);
    const privateKey = window.location.href.includes('team') ? JSON.parse(teamKeys).private : userSession.loadUserData().appPrivateKey;
    let responses = []
    for (const resp of formResponses) {
        let formObj = {};
        let decryptedResponses = JSON.parse(userSession.decryptContent(JSON.stringify(resp.responses), {privateKey: privateKey}));
        formObj.dateSubmitted = resp.dateSubmitted;
        formObj.responses = decryptedResponses;
        responses.push(formObj);
    }
    console.log(responses);
    downloadResponses(responses, singleForm.title)
  }
  refresh = () => {
    let id;
    if(window.location.href.includes('team')) {
      if(window.location.href.includes('new')) {
        id = window.location.href.split('new/')[1];
      } else {
        id = window.location.href.split('forms/')[1];
      }
    } else {
      if(window.location.href.includes('new')) {
        id = window.location.href.split('new/')[1];
      } else {
        id = window.location.href.split('forms/')[1];
      }
    }
    loadForm(id, false);
  }
  render() {
      const { formResponses, singleForm, userSession, teamKeys } = this.global;
      const questions = singleForm.questions;
      return (
        <div>
            <Button onClick={this.download}>Download Responses</Button>
            <Button onClick={this.refresh} style={{border: "none", background: "#fff", color: "#282828"}}><Icon name="refresh" /></Button>
            <Table unstackable style={{borderRadius: "0", marginTop: "10px"}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell style={{borderRadius: "0", border: "none"}}>Date Submitted</Table.HeaderCell>
                    {
                        questions.map(question => {
                            return (
                                <Table.HeaderCell key={question.id} style={{borderRadius: "0", border: "none"}}>{question.text}</Table.HeaderCell>
                            )
                        })
                    }
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {
                    formResponses.map(resp => {
                    const privateKey = window.location.href.includes('team') ? JSON.parse(teamKeys).private : userSession.loadUserData().appPrivateKey;
                    let responses = JSON.parse(userSession.decryptContent(JSON.stringify(resp.responses), {privateKey: privateKey}));
                    return(
                        <Table.Row key={resp.id} style={{ marginTop: "35px"}}>
                        <Table.Cell>{resp.dateSubmitted}</Table.Cell>
                        {
                            responses.map(response => {
                                return(
                                    <Table.Cell key={response.id}>{response.response}</Table.Cell>
                                )
                            })
                        }
                        </Table.Row>
                    );
                })
            }
            </Table.Body>
            </Table>
        </div>
       );
  }
}

export default Responses;
