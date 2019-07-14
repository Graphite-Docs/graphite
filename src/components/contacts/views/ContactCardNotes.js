import React, { Component } from 'reactn';
import { Container, Button, Feed, TextArea, Form } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { handleNote, saveNote } from '../helpers/singleContact';

class ContactCardNotes extends Component {
  render() {
      const { graphitePro, contactNotes, newNote } = this.global;
      console.log(contactNotes);

      return (
        <div>
            {graphitePro ? 
                <div>
                    <p>Add a note</p>
                    <Form>
                        <TextArea value={newNote} onChange={handleNote} placeholder='Add a note' />
                    </Form>
                    <Button style={{marginBottom: "25px"}} onClick={saveNote} className="margin-top-10" secondary>Save Note</Button>
                    <Feed>
                        {
                            contactNotes.map(note => {
                                return(
                                    <Feed.Event key={note.id}>
                                        <Feed.Label>{note.userImg ? <img src={note.userImg} alt="note user"/> : note.userName}</Feed.Label>
                                        <Feed.Content>
                                            <Feed.Summary>
                                                <Feed.User>{note.userName}</Feed.User> added a note <Feed.Date>on {note.date}</Feed.Date>
                                            </Feed.Summary>
                                            <Feed.Extra>
                                                <p>{note.note}</p>
                                            </Feed.Extra>
                                        </Feed.Content>
                                    </Feed.Event>
                                )
                            })
                        }
                    </Feed>
                </div> : 
                <Container style={{padding: "15px"}}>
                    <h3>Ready to get more?</h3>
                    <div>
                        <div>
                            <p>With Graphite Pro, you can add notes and track your communication with any given contact. <Link to={'/trial'}>Try it free for 30 days.</Link></p>
                            <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                        </div>
                    </div>
                </Container>
            }
        </div>
       );
  }
}

export default ContactCardNotes;
