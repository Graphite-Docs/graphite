import { getGlobal, setGlobal } from 'reactn';
const uuid = require('uuid/v4');
export function wrapComment(editor, comment) {
    let allComments = getGlobal().allComments;
    editor.wrapInline({
      type: 'comment',
      data: { comment },
    });
    editor.moveToEnd()
    setGlobal({ allComments: [...allComments, comment]});
}

export function unwrapComment(editor) {
    const { value } = editor;
    console.log(value.selection)
    editor.unwrapInline('comment')
}

export function hasComments() {
    const value = getGlobal().content;
    return value.inlines.some(inline => inline.type === 'comment')
}

export function onClickComment(event, editor) {
    event.preventDefault();
    const userSession = getGlobal().userSession;

    const { value } = editor;
    
    if (hasComments()) {
      const comment = {
          id: uuid(),
          author: userSession ? userSession.loadUserData().username : "Anonymous",
          comment: document.getElementById('comment-input').value
      };
      if (comment === null || comment === "") {
        return
      } else {
        
        editor.command(wrapComment, comment);
        let dimmer = document.getElementsByClassName('dimmer');
        dimmer[0].style.display = "none";
        document.getElementById('comment-modal').style.display = "none";
        document.getElementById('comment-input').value = "";
      }
    } else if (value.selection.isExpanded) {
        const comment = {
            id: uuid(),
            author: userSession ? userSession.loadUserData().username : "Anonymous",
            comment: document.getElementById('comment-input').value
        };
      if (comment === null || comment === "") {
        return
      } else {
        editor.command(wrapComment, comment);
        let dimmer = document.getElementsByClassName('dimmer');
        dimmer[0].style.display = "none";
        document.getElementById('comment-modal').style.display = "none";
        document.getElementById('comment-input').value = "";
      }
    }
}