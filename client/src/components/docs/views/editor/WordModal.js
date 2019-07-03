import React from 'reactn'

export default class WordModal extends React.Component {

    handleClose = () => {
        document.getElementById('dimmer').style.display = "none";
        document.getElementById('word-modal').style.display = "none";
    }
    render() {
        const { words, charactersSpaces, charactersNoSpaces, paragraphs, sentences, pages } = this.global;
        return( 
            <div style={{display:"none"}} id="word-modal" className="modal">
                <h2 onClick={this.handleClose}>X</h2>
                <h3>Document Info</h3>
                <ul>
                    <li>Pages: {pages}</li>
                    <li className="divider"></li>
                    <li>Paragraphs: {paragraphs}</li>
                    <li className="divider"></li>
                    <li>Sentences: {sentences}</li>
                    <li className="divider"></li>
                    <li>Words: {words}</li>
                    <li className="divider"></li>
                    <li>Characters (excluding spaces): {charactersNoSpaces}</li>
                    <li className="divider"></li>
                    <li>Characters (including spaces): {charactersSpaces}</li>
                </ul>
            </div>
        )
    }
}