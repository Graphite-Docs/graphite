import React, { Component } from "react";
// import ReactQuill from 'react-quill';
// const Font = ReactQuill.Quill.import('formats/font');
// Font.whitelist = ['Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
// ReactQuill.Quill.register(Font, true);

export default class Quill extends Component {

  componentDidMount() {
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];

     window.quill = new window.Quill('#editor', {
      modules: {
        toolbar: toolbarOptions
      },
      theme: 'bubble'
    });
  }

  render() {
    return (
      <div onChange={this.handleChange} id="editor" />
    );
  }
}
