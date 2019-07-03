import { getEventTransfer } from 'slate-react';
const uuid = require('uuid/v4')
export async function handleImageDrop(e, editor, next) {
    e.preventDefault();

    const target = editor.findEventRange(e)
    if (!target && e.type === 'drop') return next()

    const transfer = getEventTransfer(e)
    const { type, text, files } = transfer

    if (type === 'files') {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')
        if (mime !== 'image') continue

        reader.addEventListener('load', () => {
          editor.command(insertImage, reader.result, target)
        })

        reader.readAsDataURL(file)
      }
      return
    }

    // if (type === 'text') {
    //   if (!isUrl(text)) return next()
    //   if (!isImage(text)) return next()
    //   editor.command(insertImage, text, target)
    //   return
    // }

    next()

}

export async function handleImageUpload(e, editor) {
    const target = editor.findEventRange(e)
    const file = e.target.files[0];
    
    const reader = new FileReader()
    const mime = file.type.split('/')
    if(mime.includes('image')) {
        reader.addEventListener('load', () => {
            editor.command(insertImage, reader.result)
        })
    
        reader.readAsDataURL(file)
    } else {
        console.log("Not an image")
    }
    
}

export async function handleDragOver(e) {
    console.log('File(s) in drop zone'); 

    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();
}

export function insertImage(editor, src, target) {
    if (target) {
      editor.select(target)
    }
  
    editor.insertBlock({
      type: 'image',
      data: { 
          src,
          id: uuid()
        },
    })
}

export function imageAlign(id, position) {
    if(position === 'right') {
        document.getElementById(id).removeAttribute("style");
        document.getElementById(id).style.width = "50%";
        document.getElementById(id).style.float = "right";
        document.getElementById(id).style.margin = "10px";
    } else if(position === "left") {
        document.getElementById(id).removeAttribute("style");
        document.getElementById(id).style.width = "50%";
        document.getElementById(id).style.float = "left";
        document.getElementById(id).style.margin = "10px";
    } else if(position === "center") {
        document.getElementById(id).removeAttribute("style");
        document.getElementById(id).style.width = "50%";
        document.getElementById(id).style.margin = "auto";
        //document.getElementById(id).style.margin = "10px";
    }
}

export function imageSize(id, size) {
    if(size === "full") {
        document.getElementById(id).style.width = "100%";
    } else {
        document.getElementById(id).style.width = "50%";
        document.getElementById(id).style.float = "left";
    }
}