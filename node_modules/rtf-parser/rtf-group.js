'use strict'

class RTFGroup {
  constructor (parent) {
    this.parent = parent
    this.content = []
    this.fonts = []
    this.colors = []
    this.style = {}
    this.ignorable = null
  }
  get (name) {
    return this[name] != null ? this[name] : this.parent.get(name)
  }
  getFont (num) {
    return this.fonts[num] != null ? this.fonts[num] : this.parent.getFont(num)
  }
  getColor (num) {
    return this.colors[num] != null ? this.colors[num] : this.parent.getFont(num)
  }
  getStyle (name) {
    if (!name) return Object.assign({}, this.parent.getStyle(), this.style)
    return this.style[name] != null ? this.style[name] : this.parent.getStyle(name)
  }
  resetStyle () {
    this.style = {}
  }
  addContent (node) {
    node.style = Object.assign({}, this.getStyle())
    node.style.font = this.getFont(node.style.font)
    node.style.foreground = this.getColor(node.style.foreground)
    node.style.background = this.getColor(node.style.background)
    this.content.push(node)
  }
}

module.exports = RTFGroup
