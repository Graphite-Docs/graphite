import Html from 'slate-html-serializer';
const BLOCK_TAGS = {
    p: 'paragraph',
    li: 'list-item',
    ul: 'bulleted-list',
    ol: 'numbered-list',
    blockquote: 'quote',
    pre: 'code',
    h1: 'heading-one',
    h2: 'heading-two',
    h3: 'heading-three',
    h4: 'heading-four',
    h5: 'heading-five',
    h6: 'heading-six',
  }
  
  /**
   * Tags to marks.
   *
   * @type {Object}
   */
  
  const MARK_TAGS = {
    strong: 'bold',
    em: 'italic',
    u: 'underline',
    s: 'strikethrough',
    code: 'code',
  }
  
const RULES = [
    {
      deserialize(el, next) {
        const block = BLOCK_TAGS[el.tagName.toLowerCase()]
  
        if (block) {
          return {
            object: 'block',
            type: block,
            nodes: next(el.childNodes),
          }
        }
      },
    },
    {
      deserialize(el, next) {
        const mark = MARK_TAGS[el.tagName.toLowerCase()]
  
        if (mark) {
          return {
            object: 'mark',
            type: mark,
            nodes: next(el.childNodes),
          }
        }
      },
    },
    {
      // Special case for code blocks, which need to grab the nested childNodes.
      deserialize(el, next) {
        if (el.tagName.toLowerCase() === 'pre') {
          const code = el.childNodes[0]
          const childNodes =
            code && code.tagName.toLowerCase() === 'code'
              ? code.childNodes
              : el.childNodes
  
          return {
            object: 'block',
            type: 'code',
            nodes: next(childNodes),
          }
        }
      },
    },
    {
      // Special case for images, to grab their src.
      deserialize(el, next) {
        if (el.tagName.toLowerCase() === 'img') {
          return {
            object: 'block',
            type: 'image',
            nodes: next(el.childNodes),
            data: {
              src: el.getAttribute('src'),
            },
          }
        }
      },
    },
    {
      // Special case for links, to grab their href.
      deserialize(el, next) {
        if (el.tagName.toLowerCase() === 'a') {
          return {
            object: 'inline',
            type: 'link',
            nodes: next(el.childNodes),
            data: {
              href: el.getAttribute('href'),
            },
          }
        }
      },
    },
  ]

  export const serializer = new Html({ rules: RULES })
  