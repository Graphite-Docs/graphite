import React, { Component } from 'reactn';
import { Table } from 'semantic-ui-react';

class Responses extends Component {
  render() {
      const { formResponses, singleForm } = this.global;
      const questions = singleForm.questions;
      return (
        <div>
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

                    return(
                        <Table.Row key={resp.id} style={{ marginTop: "35px"}}>
                        <Table.Cell>{resp.dateSubmitted}</Table.Cell>
                        {
                            resp.responses.map(response => {
                                return(
                                    <Table.Cell>{response.response}</Table.Cell>
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
