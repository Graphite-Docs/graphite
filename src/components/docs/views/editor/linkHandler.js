import { getGlobal } from 'reactn';
export function wrapLink(editor, href) {
    editor.wrapInline({
      type: 'link',
      data: { href },
    })
  
    editor.moveToEnd()
}

export function unwrapLink(editor) {
    editor.unwrapInline('link')
}

export function hasLinks() {
    const value = getGlobal().content;
    return value.inlines.some(inline => inline.type === 'link')
}

export function onClickLink(event, editor) {
    event.preventDefault()

    const { value } = editor;
    
    if (hasLinks()) {
      console.log("has links");
      editor.command(unwrapLink);
      const href = document.getElementById('link-input').value;
      if (href === null || href === "") {
        return
      } else {
        editor.command(wrapLink, href);
        let dimmer = document.getElementsByClassName('dimmer');
        dimmer[0].style.display = "none";
        document.getElementById('link-modal').style.display = "none";
        document.getElementById('link-input').value = "";
      }
    } else if (value.selection.isExpanded) {
      const href = document.getElementById('link-input').value;
      if (href === null || href === "") {
        return
      } else {
        editor.command(wrapLink, href);
        let dimmer = document.getElementsByClassName('dimmer');
        dimmer[0].style.display = "none";
        document.getElementById('link-modal').style.display = "none";
        document.getElementById('link-modal').value = "";
      }
    } else {
        return
        //Here we could allow the user to type the text they want and hyperlink it. 
        //For now, we'll require that the text already be in the document, though

    //   const href = document.getElementById('link-input').value;

    //   if (href == null) {
    //     return
    //   }

    //   const text = window.prompt('Enter the text for the link:')

    //   if (text == null) {
    //     return
    //   }

    //   editor
    //     .insertText(text)
    //     .moveFocusBackward(text.length)
    //     .command(wrapLink, href)
    }
}