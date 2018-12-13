/* global Y */
'use strict'

function extend (Y) {
  function compareAttributes (a, b) {
    return a === b || (a == null && b == null) || (a != null && b != null && a.constructor === Array && a[0] === b[0] && a[1] === b[1])
    /* the same as..
    if (typeof a === 'string' || a == null) {
      return a === b || a == null && b == null // consider undefined
    } else {
      return a[0] === b[0] && a[1] === b[1]
    }
    */
  }
  Y.requestModules(['Array']).then(function () {
    class YRichtext extends Y.Array.typeDefinition['class'] {
      constructor (os, _model, _content) {
        super(os, _model, _content)
        this.instances = []
        // append this utility function with which eventhandler can pull changes from quill
        this.eventHandler._pullChanges = () => {
          this.instances.forEach(function (instance) {
            instance.editor.update()
          })
        }
        /*
          According to Quills documentation, these are all block-formats.
          If someone creates a custom format, it must be added here!
            Blockquote - blockquote
            Header - header
            Indent - indent
            List - list
            Text Alignment - align
            Text Direction - direction
            Code Block - code-block
        */
        this._quillBlockFormats = [
          'blockquote',
          'header',
          'indent',
          'list',
          'align',
          'direction',
          'code-block'
        ]
      }

      _sanitizeOpAttributes (attrs) {
        // return attrs
        if (attrs == null || Object.keys(attrs).length === 0) {
          return null
        } else {
          var opAttributes = {}
          for (var name in attrs) {
            if (this._quillBlockFormats.some(function (attr) { return attr === name })) {
              opAttributes['_block'] = [name, attrs[name]]
            } else {
              opAttributes[name] = attrs[name]
            }
          }
          return opAttributes
        }
      }
      /*
        Call this method before applying a format to quill.formatText()!
      */
      _formatAttributesForQuill (attrs) {
        // sreturn attrs
        var q = {}
        for (var name in attrs) {
          var val = attrs[name]
          if (name === '_block') {
            /*
            // remove all existing block formats
            this._quillBlockFormats.forEach(function (f) {
              q[f] = false
            })
            */
            if (val) {
              // add format if val is truthy
              q[attrs[name][0]] = attrs[name][1]
            }
          } else {
            q[name] = val
          }
        }
        return q
      }
      _destroy () {
        this.unbindQuillAll()
        super._destroy()
      }
      get length () {
        /*
          TODO: I must not use observe to compute the length.
          But since I inherit from Y.Array, I can't set observe
          the changes at the right momet (for that I would require direct access to EventHandler).
          This is the most elegant solution, for now.
          But at some time you should re-write Y.Richtext more elegantly!!
        */
        return this.toString().length
      }
      toString () {
        return this._content.map(function (v) {
          if (typeof v.val === 'string') {
            return v.val
          }
        }).join('')
      }
      toDelta () {
        // check last character
        // insert a newline as the last character, if neccessary
        // (quill will do that automatically otherwise..)
        var newLineCharacter = false
        for (var i = this._content.length - 1; i >= 0; i--) {
          var c = this._content[i]
          if (c.val.constructor !== Array) {
            if (c.val === '\n') {
              newLineCharacter = true
            }
            break
          }
        }
        if (!newLineCharacter) {
          this.push('\n')
        }

        // create the delta
        var ops = []
        var op = {
          insert: [],
          attributes: {}
        }
        function createNewOp () {
          var attrs = {}
          // copy attributes
          for (var name in op.attributes) {
            attrs[name] = op.attributes[name]
          }
          op = {
            insert: [],
            attributes: attrs
          }
        }
        i = 0
        for (; i < this._content.length; i++) {
          let v = this._content[i].val
          if (v.constructor === Array) {
            if ((!op.attributes.hasOwnProperty(v[0]) && v[1] == null) || op.attributes[v[0]] === v[1]) {
              continue
            }
            if (op.insert.length > 0) {
              op.insert = op.insert.join('')
              ops.push(op)
              createNewOp()
            }
            if (v[1] === null) {
              delete op.attributes[v[0]]
            } else {
              op.attributes[v[0]] = v[1]
            }
          } else if (typeof v === 'string') {
            op.insert.push(v)
          } else { // v is embed (Object)
            if (op.insert.length > 0) {
              op.insert = op.insert.join('')
              ops.push(op)
              createNewOp()
            }
            op.insert = v
            ops.push(op)
            createNewOp()
          }
        }
        if (op.insert.length > 0) {
          op.insert = op.insert.join('')
          ops.push(op)
        }
        ops.forEach((op) => {
          if (Object.keys(op.attributes).length === 0) {
            delete op.attributes
          } else {
            op.attributes = this._formatAttributesForQuill(op.attributes)
          }
        })
        return ops
      }
      insert (pos, content) {
        var curPos = 0
        var selection = {}
        for (var i = 0; i < this._content.length; i++) {
          if (curPos === pos) {
            break
          }
          var v = this._content[i].val
          if (v.constructor !== Array) {
            curPos++
          } else {
            if (v[1] === null) {
              delete selection[v[0]]
            } else {
              selection[v[0]] = v[1]
            }
          }
        }
        var ins
        if (typeof content === 'string') {
          ins = content.split('')
        } else if (content.constructor === Object) {
          ins = [content]
        } else {
          ins = content
        }
        super.insert(i, ins)
        return selection
      }
      delete (pos, length) {
        /*
          let x = to be deleted string
          let s = some string
          let * = some selection
          E.g.
          sss*s***x*xxxxx***xx*x**ss*s
               |---delete-range--|
             delStart         delEnd

          We'll check the following
          * is it possible to delete some of the selections?
            1. a dominating selection to the right could be the same as the selection (curSel) to delStart
            2. a selections could be overwritten by another selection to the right
        */
        var curPos = 0
        var curSel = {}
        var endPos = pos + length
        if (length <= 0) return
        var delStart // relative to _content
        var delEnd // ..
        var v, i // helper variable for elements of _content

        for (delStart = 0; curPos < pos && delStart < this._content.length; delStart++) {
          v = this._content[delStart].val
          if (v.constructor !== Array) {
            curPos++
          } else {
            curSel[v[0]] = v[1]
          }
        }
        for (delEnd = delStart; curPos < endPos && delEnd < this._content.length; delEnd++) {
          v = this._content[delEnd].val
          if (v.constructor !== Array) {
            curPos++
          }
        }
        if (delEnd === this._content.length) {
          // yay, you can delete everything without checking
          super.delete(delStart, delEnd - delStart)
        } else {
          if (v.constructor !== Array) {
            delEnd--
          }
          var rightSel = {}
          for (i = delEnd; i >= delStart; i--) {
            v = this._content[i].val
            if (v.constructor === Array) {
              if (rightSel[v[0]] === undefined) {
                if (compareAttributes(v[1], curSel[v[0]])) {
                  // case 1.
                  super.delete(i, 1)
                }
                rightSel[v[0]] = v[1]
              } else {
                // case 2.
                super.delete(i, 1)
              }
            } else {
              var end = i + 1
              while (i > delStart) {
                v = this._content[i - 1].val
                if (v.constructor !== Array) {
                  i--
                } else {
                  break
                }
              }
              // always delete the strings
              super.delete(i, end - i)
            }
          }
        }
      }
      /*
      1. get selection attributes from position $from
         (name it antiAttrs, and we'll use it to make sure that selection ends in antiAttrs)
      2. Insert selection $attr, if necessary
      3. Between from and to, we'll delete all selections that do not match $attr.
         Furthermore, we'll update antiAttrs, if necessary
      4. In the end well insert a selection that makes sure that selection($to) ends in antiAttrs

      Special case (which is quill related): There may only be one format on \n.
      If a user inserts a format on a newline character, all existing formats are deleted.
      Quill denotes to these types of formats as block formats. The following block formats are defined:
          Blockquote - blockquote
          Header - header
          Indent - indent
          List - list
          Text Alignment - align
          Text Direction - direction
          Code Block - code-block

      */
      select (from, to, attrName, attrValue) {
        if (from == null || to == null || attrName == null || attrValue === undefined) {
          throw new Error('You must define four parameters')
        } else {
          var step2i
          var step2sel
          var antiAttrs = [attrName, null]
          var curPos = 0
          var i = 0
          // 1. compute antiAttrs
          for (; i < this._content.length; i++) {
            if (curPos === from) {
              break
            }
            let v = this._content[i].val
            if (v.constructor === Array) {
              // selection
              if (v[0] === attrName) { // compare names
                antiAttrs[1] = v[1]
              }
            } else {
              // embed or text
              curPos++
            }
          }
          // 2. Insert attr
          if (!compareAttributes(antiAttrs[1], attrValue)) {
            // we'll execute this later
            step2i = i
            step2sel = [attrName, attrValue]
          }

          // 3. update antiAttrs, modify selection
          var deletes = []
          for (; i < this._content.length; i++) {
            if (curPos === to) {
              break
            }
            let v = this._content[i].val
            if (v.constructor === Array) {
              // selection
              if (v[0] === attrName) { // compare names
                antiAttrs[1] = v[1]
                deletes.push(i)
              }
            } else {
              // embed or text
              curPos++
            }
          }
          // actually delete the found selections
          // also.. we have to delete from right to left (so that the positions dont change)
          for (var j = deletes.length - 1; j >= 0; j--) {
            var del = deletes[j]
            super.delete(del, 1)
            // update i, rel. to
            if (del < i) {
              i--
            }
            if (del < step2i) {
              step2i--
            }
          }
          // 4. Update selection to match antiAttrs
          // never insert, if not necessary
          //  1. when it is the last position ~ i < _content.length)
          //  2. when a similar attrName already exists between i and the next character
          if (!compareAttributes(antiAttrs[1], attrValue) && i < this._content.length) { // check 1.
            var performStep4 = true
            var v
            for (j = i; j < this._content.length; j++) {
              v = this._content[j].val
              if (v.constructor !== Array) {
                break
              }
              if (v[0] === attrName) { // compare names
                performStep4 = false // check 2.
                if (compareAttributes(v[1], attrValue)) {
                  super.delete(j, 1)
                }
                break
              }
            }
            if (performStep4) {
              var sel = [attrName, antiAttrs[1]]
              super.insert(i, [sel])
            }
          }
          if (step2i != null) {
            super.insert(step2i, [step2sel])
            // if there are some selections to the left of step2sel, delete them if possible
            // * have same attribute name
            // * no insert between step2sel and selection
            for (j = step2i - 1; j >= 0; j--) {
              v = this._content[j].val
              if (v.constructor !== Array) {
                break
              }
              if (v[0] === attrName) {
                super.delete(j, 1)
              }
            }
          }
        }
      }
      /*
        This method accepts a quill delta (http://quilljs.com/docs/deltas/)
        The second parameter (_quill) is optional (it is only necessary when binding a quill instance)
      */
      applyDelta (delta, _quill) {
        var pos = 0
        var name // helper variable
        for (var i = 0; i < delta.ops.length; i++) {
          var op = delta.ops[i]
          var opAttributes = this._sanitizeOpAttributes(op.attributes)
          var attrs
          var insLength
          if (op.insert != null) {
            if (typeof op.insert === 'string') {
              attrs = this.insert(pos, op.insert)
              insLength = op.insert.length
            } else { // typeof is Object
              attrs = this.insert(pos, op.insert)
              insLength = 1
            }
            // create new selection
            for (name in opAttributes) {
              if (!compareAttributes(opAttributes[name], attrs[name])) {
                this.select(pos, pos + insLength, name, opAttributes[name])
              }
            }
            // not-existence of an attribute in opAttributes denotes
            // that we have to unselect (set to null)
            for (name in attrs) {
              if (opAttributes == null || opAttributes[name] == null) {
                this.select(pos, pos + insLength, name, null)
              }
            }
            pos += insLength
          }
          if (op.delete != null) {
            this.delete(pos, op.delete)
          }
          if (op.retain != null && _quill != null) {
            var afterRetain = pos + op.retain
            if (afterRetain > this.length) {
              // debugger // TODO: check why this is still called..
              // console.warn('Yjs internal: This should not happen')
              let additionalContent = _quill.getText(this.length)
              _quill.insertText(this.length, additionalContent)
              // quill.deleteText(this.length + additionalContent.length, quill.getLength()) the api changed!
              for (name in opAttributes) {
                let format = {}
                format[name] = false
                format = this._formatAttributesForQuill(format)
                // TODO: format expects falsy values now in order to remove formats
                _quill.formatText(this.length + additionalContent.length, additionalContent.length, format)
                // quill.deleteText(this.length, this.length + op.retain) the api changed!
              }
              this.insert(this.length, additionalContent)
              // opAttributes = null
            }
            for (name in opAttributes) {
              var attr = opAttributes[name]
              this.select(pos, afterRetain, name, attr)
              /*
              let format = {}
              format[name] = attr == null ? false : attr
              format = this._formatAttributesForQuill(format)
              if (name === '_block') {
                var removeFormat = {}
                this._quillBlockFormats.forEach((f) => { removeFormat[f] = false })
                _quill.formatText(pos, op.retain, removeFormat)
              }
              _quill.formatText(pos, op.retain, format)
              */
            }
            pos = afterRetain
          }
        }
      }
      bind () {
        this.bindQuill.apply(this, arguments)
      }
      unbindQuillAll () {
        for (var i = this.instances.length - 1; i >= 0; i--) {
          this.unbindQuill(this.instances[i].editor)
        }
      }
      unbindQuill (quill) {
        var i = this.instances.findIndex(function (binding) {
          return binding.editor === quill
        })
        if (i >= 0) {
          var binding = this.instances[i]
          binding.editor.yRichtextBinding = null
          this.unobserve(binding.yCallback)
          binding.editor.off('text-change', binding.quillCallback)
          this.instances.splice(i, 1)
        }
      }
      bindQuill (quill) {
        var self = this

        // this function makes sure that either the
        // quill event is executed, or the yjs observer is executed
        var token = true
        function mutualExcluse (f) {
          if (token) {
            token = false
            try {
              f()
            } catch (e) {
              quill.update()
              token = true
              throw new Error(e)
            }
            quill.update()
            token = true
          }
        }
        if (quill.yRichtextBinding != null) {
          quill.yRichtextBinding.unbindQuill(quill)
        }
        quill.setContents(this.toDelta())
        quill.update()

        function quillCallback (delta) {
          mutualExcluse(function () {
            self.applyDelta(delta, quill)
          })
        }
        // TODO: Investigate if 'editor-change' is more appropriate!
        quill.on('text-change', quillCallback)

        function yCallback (event) {
          mutualExcluse(function () {
            var v // helper variable
            var curSel // helper variable (current selection)
            if (event.type === 'insert') {
              var valuePointer = 0
              while (valuePointer < event.values.length) {
                var vals = []
                while (valuePointer < event.values.length && event.values[valuePointer].constructor !== Array) {
                  vals.push(event.values[valuePointer])
                  valuePointer++
                }
                if (vals.length > 0) { // insert new content (text and embed)
                  var position = 0
                  var insertSel = {}
                  for (var l = 0; l < event.index; l++) {
                    v = self._content[l].val
                    if (v.constructor !== Array) {
                      position++
                    } else {
                      insertSel[v[0]] = v[1]
                    }
                  }
                  // consider the case (this is markup): "hi *you*" & insert "d" at position 3
                  // Quill may implicitely make "d" bold (dunno if thats true). Yjs, however, expects d not to be bold.
                  // So we check future attributes and explicitely set them, if neccessary
                  l = event.index + event.length
                  while (l < self._content.length) {
                    v = self._content[l].val
                    if (v.constructor === Array) {
                      if (!insertSel.hasOwnProperty(v[0])) {
                        insertSel[v[0]] = null
                      }
                    } else {
                      break
                    }
                    l++
                  }
                  // TODO: you definitely should exchange null with the new "false" approach..
                  // Then remove the following! :
                  for (var name in insertSel) {
                    if (insertSel[name] == null) {
                      insertSel[name] = false
                    }
                  }
                  if (self.length === position + vals.length && vals[vals.length - 1] !== '\n') {
                    // always make sure that the last character is enter!
                    var end = ['\n']
                    var sel = {}
                    // now we remove all selections
                    for (name in insertSel) {
                      if (insertSel[name] !== false) {
                        end.unshift([name, false])
                        sel[name] = false
                      }
                    }
                    Y.Array.typeDefinition.class.prototype.insert.call(self, position + vals.length, end)
                    // format attributes before pushing to quill!
                    quill.insertText(position, '\n', self._formatAttributesForQuill(sel))
                  }
                  // create delta from vals
                  var delta = []
                  if (position > 0) {
                    delta.push({ retain: position })
                  }
                  var currText = []
                  vals.forEach(function (v) {
                    if (typeof v === 'string') {
                      currText.push(v)
                    } else {
                      if (currText.length > 0) {
                        delta.push({
                          insert: currText.join(''),
                          attributes: insertSel
                        })
                        currText = []
                      }
                      delta.push({
                        insert: v,
                        attributes: insertSel
                      })
                    }
                  })
                  if (currText.length > 0) {
                    delta.push({
                      insert: currText.join(''),
                      attributes: insertSel
                    })
                  }
                  // format attributes before pushing to quill!
                  delta.forEach(d => {
                    if (d.attributes != null && Object.keys(d.attributes).length > 0) {
                      d.attributes = self._formatAttributesForQuill(d.attributes)
                    } else {
                      delete d.attributes
                    }
                  })
                  quill.updateContents(delta)
                  // quill.insertText(position, vals.join(''), insertSel)
                } else { // Array (selection)
                  // a new selection is created
                  // find left selection that matches newSel[0]
                  curSel = null
                  var newSel = event.values[valuePointer++] // get selection, increment counter
                  // denotes the start position of the selection
                  // (without the selection objects)
                  var selectionStart = 0
                  for (var j = event.index + valuePointer - 2/* -1 for index, -1 for incremented valuePointer */; j >= 0; j--) {
                    v = self._content[j].val
                    if (v.constructor === Array) {
                      // check if v matches newSel
                      if (newSel[0] === v[0]) { // compare names
                        // found a selection
                        // update curSel and go to next step
                        curSel = v[1]
                        break
                      }
                    } else {
                      selectionStart++
                    }
                  }
                  // make sure to decrement j, so we correctly compute selectionStart
                  for (; j >= 0; j--) {
                    v = self._content[j].val
                    if (v.constructor !== Array) {
                      selectionStart++
                    }
                  }
                  // either a selection was found {then curSel was updated}, or not (then curSel = null)
                  if (compareAttributes(newSel[1], curSel)) {
                    // both are the same. not necessary to do anything
                    continue
                  }
                  // now find out the range over which newSel has to be created
                  var selectionEnd = selectionStart
                  for (var k = event.index + valuePointer/* -1 for incremented valuePointer, +1 for algorithm */; k < self._content.length; k++) {
                    v = self._content[k].val
                    if (v.constructor === Array) {
                      if (v[0] === newSel[0]) { // compare names
                        // found another selection with same attr name
                        break
                      }
                    } else {
                      selectionEnd++
                    }
                  }
                  // create a selection from selectionStart to selectionEnd
                  if (selectionStart !== selectionEnd) {
                    // format attributes before pushing to quill!!
                    var format = {}
                    format[newSel[0]] = newSel[1] == null ? false : newSel[1]
                    format = self._formatAttributesForQuill(format)
                    if (newSel[0] === '_block') {
                      var removeFormat = {}
                      self._quillBlockFormats.forEach((f) => { removeFormat[f] = false })
                      quill.formatText(selectionStart, selectionEnd - selectionStart, removeFormat)
                    }
                    quill.formatText(selectionStart, selectionEnd - selectionStart, format)
                  }
                }
              }
            } else if (event.type === 'delete') {
              // sanitize events
              var myEvents = []
              for (var i = 0, _i = 0; i < event.length; i++) {
                if (event.values[i].constructor === Array) {
                  if (i !== _i) {
                    myEvents.push({
                      type: 'text',
                      length: i - _i,
                      index: event.index
                    })
                  }
                  _i = i + 1
                  myEvents.push({
                    type: 'selection',
                    val: event.values[i],
                    index: event.index
                  })
                }
              }
              if (i !== _i) {
                myEvents.push({
                  type: 'text',
                  length: i - _i,
                  index: event.index
                })
              }
              // ending sanitizing.. start brainfuck
              myEvents.forEach(function (event) {
                if (event.type === 'text') {
                  var pos = 0
                  for (var u = 0; u < event.index; u++) {
                    v = self._content[u].val
                    if (v.constructor !== Array) {
                      pos++
                    }
                  }
                  quill.deleteText(pos, event.length)
                } else {
                  curSel = null
                  var from = 0
                  var x
                  for (x = event.index - 1; x >= 0; x--) {
                    v = self._content[x].val
                    if (v.constructor === Array) {
                      if (v[0] === event.val[0]) { // compare names
                        curSel = v[1]
                        break
                      }
                    } else {
                      from++
                    }
                  }
                  for (; x >= 0; x--) {
                    v = self._content[x].val
                    if (v.constructor !== Array) {
                      from++
                    }
                  }
                  var to = from
                  for (x = event.index; x < self._content.length; x++) {
                    v = self._content[x].val
                    if (v.constructor === Array) {
                      if (v[0] === event.val[0]) { // compare names
                        break
                      }
                    } else {
                      to++
                    }
                  }
                  if (!compareAttributes(curSel, event.val[1]) && from !== to) {
                    // format attributes before pushing to quill!!
                    var format = {}
                    format[event.val[0]] = curSel == null ? false : curSel
                    format = self._formatAttributesForQuill(format)
                    if (event.val[0] === '_block') {
                      var removeFormat = {}
                      self._quillBlockFormats.forEach((f) => { removeFormat[f] = false })
                      quill.formatText(from, to - from, removeFormat)
                    }
                    quill.formatText(from, to - from, format)
                  }
                }
              })
            }
            quill.update()
          })
        }
        this.observe(yCallback)
        this.instances.push({
          editor: quill,
          yCallback: yCallback,
          quillCallback: quillCallback
        })
        quill.yRichtextBinding = this
      }
    }
    Y.extend('Richtext', new Y.utils.CustomTypeDefinition({
      name: 'Richtext',
      class: YRichtext,
      struct: 'List',
      initType: function * YTextInitializer (os, model) {
        var _content = []
        yield * Y.Struct.List.map.call(this, model, function (op) {
          if (op.hasOwnProperty('opContent')) {
            throw new Error('Text must not contain types!')
          } else {
            op.content.forEach(function (c, i) {
              _content.push({
                id: [op.id[0], op.id[1] + i],
                val: op.content[i]
              })
            })
          }
        })
        return new YRichtext(os, model.id, _content)
      },
      createType: function YRichtextCreator (os, model) {
        return new YRichtext(os, model.id, [])
      }
    }))
  })
}

module.exports = extend
if (typeof Y !== 'undefined') {
  extend(Y)
}
