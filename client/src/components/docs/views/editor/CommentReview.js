import React from 'reactn'
import { Icon } from 'semantic-ui-react';

export default class CommentReview extends React.Component {
    handleClose = () => {
        document.getElementById('comment-review-modal').style.display = "none";
    }
    findComment = (id) => {
        document.getElementById(`comment:${id}`).scrollIntoView(true);
    }
    render() {
        const { allComments } = this.global;
        return( 
            <div style={{display:"none"}} id="comment-review-modal">
                <p style={{position: "absolute", top: "0", right: "10px", cursor: "pointer"}} onClick={this.handleClose}><Icon name="close" /></p>
                <h2 style={{fontWeight: "200", marginLeft: "20px"}}>All Comments</h2>
                <hr/>
                <div style={{overflowY: "scroll", position: "absolute", width: "100%", height: "100%"}}>
                {
                    allComments.map(comment => {
                        return (
                            <div style={{marginTop: "5px", marginTop: "5px"}} key={comment.id}>
                                <div style={{marginLeft: "10px"}}>{comment.comment}</div>
                                <button style={{marginLeft: "10px"}} className="save-button" onClick={() => this.findComment(comment.id)}>View</button>
                                <hr/>
                            </div>
                        )
                    })
                }
                </div>
            </div>
        )
    }
}