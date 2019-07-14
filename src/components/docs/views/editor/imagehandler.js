import { getEventTransfer } from 'slate-react';
const uuid = require('uuid/v4')
export async function handleImageDrop(e, editor, next) {
    e.preventDefault();

    const target = editor.findEventRange(e)
    if (!target && e.type === 'drop') return next()

    const transfer = getEventTransfer(e)
    const { type, files } = transfer

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

    next()

}

export async function handleImageUpload(e, editor) {
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
          id: uuid(), 
          class: "image-block image-small-left"
        }
    })
}

export function imageAlign(editor, id, src, key, position) {
    console.log(position)
    if(position === 'right') {
        editor.removeNodeByKey(key)
        .insertBlock({
            type: 'image',
            data: { 
                src,
                id: id, 
                class: "image-block image-small-right"
                }
        });
    } else if(position === "left") {
        editor.removeNodeByKey(key)
        .insertBlock({
            type: 'image',
            data: { 
                src,
                id: id, 
                class: "image-block image-small-left"
                }
        });
    } else if(position === "center") {
        editor.removeNodeByKey(key)
        .insertBlock({
            type: 'image',
            data: { 
                src,
                id: id, 
                class: "image-block image-small-center"
                }
        })
    }
}

export function imageSize(editor, id, src, key, size) {
    if(size === "full") {
        editor.removeNodeByKey(key)
        .insertBlock({
            type: 'image',
            data: { 
                src,
                id: id, 
                class: "image-block image-full"
                }
        })
    } else {
        editor.removeNodeByKey(key)
        .insertBlock({
            type: 'image',
            data: { 
                src,
                id: id, 
                class: "image-block image-small-left"
                }
        })
    }
}