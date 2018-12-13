import React from 'react';
import FroalaEditorFunctionality from './FroalaEditorFunctionality.jsx';

export default class FroalaEditorInput extends FroalaEditorFunctionality {

  render () {
    return (
      <input ref='el'/>
    );
  }
}