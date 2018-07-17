import React, { Component } from 'react';
import ReactQuill, {Quill} from 'react-quill';
import ImageResize from 'quill-image-resize-module';

const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['Roboto', 'Lato', 'Open Sans', 'Montserrat'] ; // allow ONLY these fonts and the default
ReactQuill.Quill.register(Font, true);
Quill.register('modules/imageResize', ImageResize);



export default class ReactQuillTextEditor extends Component {

  // comment out the below to re-render TextEdit on every click -- using this life cycle method to prevent TextEdit and Yjs from needlessly re-rendering, note: React docs say NOT to use this method for this purpose
  shouldComponentUpdate(nextProps) {
    // console.log('1. this.props === nextProps: ', this.props === nextProps) //false because objects' internal values could be different...
    // console.log('2. this.props.docLoaded === nextProps.docLoaded: ', this.props.docLoaded === nextProps.docLoaded) //this is true, it's a specific value within those objects
    if (this.props.docLoaded === nextProps.docLoaded) { //these two should always be equal...
      console.warn('ReactQuillTextEditor - (this.props.docLoaded === nextProps.docLoaded), so returning FALSE in shouldComponentUpdate... AKA no re-render...')
      return false; // don't re-render this component (or its children) if the only state change is "a", "b", or "c" getting clicked...
    } else {
      return true; //default return value for shouldComponentUpdate is true
    }
  }

  renderView() {
    // console.log('ReactQuillTextEditor - renderView - this.state.userToLoadFrom:', this.state.userToLoadFrom)
    // console.log('ReactQuillTextEditor - renderView - this.state.idToLoad:', this.state.idToLoad);
    ReactQuillTextEditor.modules = {
      toolbar: [
        //[{ font: Font.whitelist }],
        [{ header: 1 }, { header: 2 }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ align: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['video'],
        ['image'],
        ['link'],
      ],
      imageResize: {
        modules: ['Resize', 'DisplaySize']
      },
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      }
    }
    return(
      <div>

        {/* <h1>
          ReactQuill component
        </h1> */}

        {
          (this.props.docLoaded === true)
          ?
          <ReactQuill
            ref={(el) => { this.reactQuillRef = el }}  //<<<<<------- need this...???
            modules={ReactQuillTextEditor.modules}
            // id="textarea1"   //does this need to be textarea1 ???
            id={this.props.roomId}
            className="materialize-textarea"
            placeholder="Write something great"
            value={this.props.value}  //getting this from PublicDoc... need to pass props to ReactQuill, but will Yjs still sync?
            onChange={this.props.onChange} //getting this from PublicDoc...
            theme="bubble"
          />
          :
          "Loading..."
        }
      </div>
    )
  }

  render() {
    console.log('ReactQuillTextEditor - render');
    return (
      <div>

        {/* <div className="container"> */}
          {this.renderView()}
        {/* </div> */}

      </div>
    );
  }
}
