import React, { setGlobal, getGlobal } from 'reactn';
import { imageAlign, imageSize } from './imagehandler';
import alignLeft from './assets/icons/align-left.svg';
import alignCenter from './assets/icons/align-center.svg';
import alignRight from './assets/icons/align-right.svg';
import arrowsAlt from './assets/icons/compress-arrows-alt.svg';
import arrowsAltH from './assets/icons/arrows-alt-h.svg';

export function hanldeTOCNav(id) {
  document.getElementById(id).scrollIntoView();
}

export function renderMark(props, editor, next) {
    switch (props.mark.type) {
      case 'bold':
        return <strong {...props.attributes}>{props.children}</strong>
      case 'italic': 
        return <i {...props.attributes}>{props.children}</i>
      case 'underline': 
        return <u {...props.attributes}>{props.children}</u>
      case 'strikethrough': 
        return <del {...props.attributes}>{props.children}</del>
      case 'super': 
        return <sup {...props.attributes}>{props.children}</sup>
      case 'sub': 
        return <sub {...props.attributes}>{props.children}</sub>
      case 'code': 
        return <code {...props.attributes}>{props.children}</code>
      case 'font-family': 
        return <span style={{ fontFamily: props.mark.data.get('font') }}>
            {props.children}
        </span>
      case 'font-size': 
        const id = props.mark.data.get('id');
        const size = props.mark.data.get('size');
        const style = document.createElement('style');
        style.innerHTML = `@media print { #${id} { font-size: ${size}pt; } }`
        document.head.appendChild(style);
        return <span style={{ fontSize: `${props.mark.data.get('size')}px` }}>
            {props.children}
        </span>
      case 'font-color': 
        return <span style={{ color: `#${props.mark.data.get('color')}` }}>
            {props.children}
        </span>
      case 'highlight-color': 
        return <span style={{ background: `#${props.mark.data.get('highlight')}` }}>
            {props.children}
        </span>
      default:
        return next()
    }
}

export function renderBlock(props, editor, next) {
    const { attributes, children, node } = props;
    const tableOfContents = getGlobal().tableOfContents;
    switch (node.type) {
      case 'table-of-contents':
        return (
          <div className="table-of-contents" {...attributes}>
            <h3>Table of Contents</h3>
            <ul>
            {
              tableOfContents.map(item => {
                return(
                  <li key={item.id}><a onClick={() => hanldeTOCNav(item.id)} href={`#${item.id}`}>{item.text}</a></li>
                )
              })
            }
            </ul>
          </div>
        )
      case 'block-quote':
        return <blockquote className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</blockquote>
      case 'unordered-list':
        setGlobal({nodeType: "unordered"});
        return <ul className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</ul>
      case 'h1':
        return <h1 className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</h1>
      case 'h2':
        return <h2 className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</h2>
      case 'h3':
        return <h3 className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</h3>
      case 'h4':
        return <h4 className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</h4>
      case 'h5':
        return <h5 className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</h5>
      case 'h5':
        return <span className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</span>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'ordered-list':
        setGlobal({nodeType: "ordered"});
        return <ol className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</ol>
      case 'paragraph':
        return <p className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</p>
      case 'image': {
          const src = node.data.get('src');
          const id = node.data.get('id');
          return (
            <div className="image-block" id={id} style={{width: "50%", float: "left"}} onClick={() => revealImageMenus(id)}>
              <img
                {...attributes}
                src={src}
                className="doc-image"
              />
              <div className="image-menu" id={`image-menu-${id}`}style={{display: "none"}}>
                <ul className="image-position">
                  <li onClick={() => imageAlign(id, "left")}><img src={alignLeft} alt="align left icon" /></li>
                  <li onClick={() => imageAlign(id, "center")}><img src={alignCenter} alt="align center icon" /></li>
                  <li onClick={() => imageAlign(id, "right")}><img src={alignRight} alt="align right icon" /></li>
                  <li onClick={() => imageSize(id, 'half')}><img src={arrowsAlt} alt="half-width icon" /></li>
                  <li onClick={() => imageSize(id, 'full')}><img src={arrowsAltH} alt="full-width icon" /></li>
                </ul>
              </div>
            </div>
            
          )
      }
      case 'table': {
        return(
          <table className="doc-table" {...attributes}>
            {children}
          </table>
        )
      }
      case 'table_row':
        return (
          <tr className="doc-tr" {...attributes}>{children}</tr>
        )
      case 'table_cell': 
          return(
            <td className="doc-td" {...attributes}>{children}</td>
          )
      case 'alignment-div': 
        return <div className={node.data.get('class') ? node.data.get('class') : ""} {...attributes}>{children}</div>
      case 'tab': 
        return <pre {...attributes}>{children}</pre>
      // case 'circle':
      //   return (
      //     <svg {...attributes} className="svg-shapes" id={thisId} draggable="true" onClick={() => handleShapeClick(thisId)} height="100" width="100">
      //       <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" fill="white" />
      //     </svg>
      //   )  
      // case 'rectangle':
      //     return (
      //         <svg {...attributes} className="svg-shapes" id={thisId} draggable="true" onClick={() => handleShapeClick(thisId)} width="400" height="110">
      //           <rect width="300" height="100" stroke="black" strokeWidth="3" fill="white" />
      //         </svg> 
      //     )  
      // case 'square':
      //     return (
      //           <svg {...attributes} viewBox="0 0 300 300" className="svg-shapes" id={thisId} draggable="true" onClick={() => handleShapeClick(thisId)} width="400" height="400">
      //               <rect width="300" height="300" stroke="black" strokeWidth="3" fill="white" />
      //           </svg> 
      //     )
          
      // case 'horizontal-line':
      //     return (
      //       <svg {...attributes} className="svg-shapes" id={thisId} draggable="true" onClick={() => handleShapeClick(thisId)} height="100" width="500">
      //         <line x1="0" y1="50" x2="500" y2="50"  stroke="black" strokeWidth="3" fill="black"/>
      //       </svg>
      //     )

      // case 'vertical-line':
      //   let id = uuid();
      //   return (
      //     <svg {...attributes} className="svg-shapes" id={thisId} draggable="true" onClick={() => handleShapeClick(thisId)} height="500" width="3">
      //       <rect width="3" height="500" stroke="black" strokeWidth="3" fill="white" />
      //     </svg>
      //   )
      case "hr": 
          return (
            <hr className="hr" {...attributes} />
          )
      default:
        return next()
    }
}

export function revealImageMenus(id) {
  document.getElementById(`image-menu-${id}`).style.display = "block";
  document.getElementById(id).style.border = "0.5px solid rgb(26, 115, 232)"
  document.getElementById(id).style.padding = "3px"
}

export function renderInline(props, editor, next) {
  const { attributes, children, node } = props
  switch (node.type) {
    case 'link': {
      const { data } = node
      const href = data.get('href')
      return (
        <a {...attributes} href={href}>
          {children}
        </a>
      )
    }
    case 'comment': {
      const { data } = node;
      const comment = data.get('comment');
      return (
        <mark className="mark" style={{cursor: "pointer", textAlign: "center"}} {...attributes}>
          <span style={{display: "none"}} className="modal comment-modal" id={comment.id}>
            <span style={{marginBottom:"15px"}} className="comment-text">{comment.comment}</span><br/><br/>
            <button className="save-button" onClick={() => resolveComment(editor, node.key)}>Resolve</button><button className="cancel-button" onClick={() => handleCloseCommentModal(comment)}>Close</button>
          </span>
          <abbr id={`comment:${comment.id}`} title={comment} onClick={() => handleCommentModal(comment)}>{children}</abbr>
        </mark>
      )
    }
    default: {
      return next()
    }
  }
}

export function resolveComment(editor, key) {
  editor.unwrapInlineByKey(key);
  let dimmer = document.getElementsByClassName('dimmer')[0];
  dimmer.style.display = "none";
}

export function handleCommentModal(comment) {
  let dimmer = document.getElementsByClassName('dimmer')[0];
  document.getElementById(comment.id).style.display = "block";
  dimmer.style.display = "block";
}

export function handleCloseCommentModal(comment) {
  let dimmer = document.getElementsByClassName('dimmer')[0];
  document.getElementById(comment.id).style.display = "none";
  dimmer.style.display = "none";
}