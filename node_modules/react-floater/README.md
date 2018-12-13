React Floater
===

[![NPM version](https://badge.fury.io/js/react-floater.svg)](https://www.npmjs.com/package/react-floater)
[![build status](https://travis-ci.org/gilbarbara/react-floater.svg)](https://travis-ci.org/gilbarbara/react-floater)
[![Maintainability](https://api.codeclimate.com/v1/badges/a3457f536c0915c0935b/maintainability)](https://codeclimate.com/github/gilbarbara/react-floater/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a3457f536c0915c0935b/test_coverage)](https://codeclimate.com/github/gilbarbara/react-floater/test_coverage)

### View the [demo](https://84vn36m178.codesandbox.io/)
You can view and edit the code for each Floater [here](https://codesandbox.io/s/84vn36m178)

## Usage

Install.

```bash
npm install --save react-floater
```

Import it into your component:

```jsx
import Floater from 'react-floater';

<Floater content="This is the Floater content">
    <span>click me</span>
</Floater>

```

And voíla!

## Customization

You can use your own components to render the Floater with the prop `component`.  
Check `WithStyledComponents.js` in the [demo](https://84vn36m178.codesandbox.io/) for an example.

If you use your own components as `children` it will receive an `innerRef` prop that you must set in your HTMLElement:  
*Stateless components don't accept refs...*

```jsx
const Button = ({ innerRef, ...rest }) => (
  <button ref={innerRef} {...rest} />
);

...
<Floater content="This is the Floater content">
    <Button>click me</Button>
</Floater>
```

This works transparently with styled-components (and possible other modules):  

```jsx
const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 500px;
  line-height: 1.5;
`;

<Floater content="This is the Floater content">
    <Wrapper>click me</Wrapper>
</Floater>

```

## Props

**autoOpen** {bool} ▶︎ `false`  
Open the Floater automatically.

**callback** {func}  
It will be called when the Floater change state with 2 parameters:

- **action** {string} `open` or `close`  
- **props** {object} the props you passed.

**children** {node}  
An element to trigger the Floater.

**component** {element|function}  
A React component or function to as a custom UI for the Floater.  
The prop `closeFloater` will be available in your component.

**content** {node}  
The Floater content. It can be anything that can be rendered.  
*This is the only required props, unless you pass a* `component`.

**debug** {bool} ▶︎ `false`  
Log some basic actions.  
*You can also set a global variable* `ReactFloaterDebug = true;`

**disableAnimation** {bool} ▶︎ `false`  
Animate the Floater on scroll/resize.

**disableFlip** {bool} ▶︎ `false`  
Disable changes in the Floater position on scroll/resize.

**disableHoverToClick** {bool} ▶︎ `false`  
Don't convert *hover* event to *click* on mobile.

**event** {string} ▶︎ `click`  
The event that will trigger the Floater. It can be `hover | click`.  
*These won't work in controlled mode.*

**eventDelay** {number} ▶︎ `0.4`  
The amount of time (in seconds) that the floater should wait after a `mouseLeave` event before hiding.  
Only valid for event type `hover`.

**footer** {node}  
It can be anything that can be rendered.

**id** {string|number}  
In case that you need to identify the portal.

**offset** {number} ▶︎ `15`  
The distance between the Floater and its target in pixels.

**open** {bool} ▶︎ `false`  
The switch between normal and controlled modes.  
*Setting this prop will disabled the normal behavior.*

**placement** {string} ▶︎ `bottom`  
The placement of the Floater. It will update the position if there's no space available.

It can be:

- top (top-start, top-end)
- bottom (bottom-start, bottom-end)
- left (left-start, left-end)
- right (right-start, right-end
- auto
- center

**showCloseButton** {bool} ▶︎ `false`  
It will show a ⨉ button to close the Floater.  
This will be `true` when you change `wrapperOptions` position.

**styles** {object} ▶︎ `defaultStyles`  
You can customize the UI using this prop.

**target** {object|string}  
The target used to calculate the Floater position. If it's not set, it will use the `children` as the target.

**title** {node}  
It can be anything that can be rendered.

**wrapperOptions** {object}  
Position the wrapper relative to the target.  
*You need to set a `target` for this to work.*

```js
{
    offset: number, // The distance between the wrapper and the target. It can be negative.
    placement: string, // the same options as above, except center
    position: bool, // Set to true to position the wrapper
}
```


## Styling
You can customize everything with the `styles` prop.  
Only set the properties you want to change and the default [styles](./src/styles.js) will be merged.

Check it [styles.js](./src/styles.js) for the syntax.


## Modes

**Default**  
The wrapper will trigger the events and use itself as the Floater's target.

```jsx
<Floater content="This is the Floater content">
    <span>click me</span>
</Floater>

```

**Proxy**  
The wrapper will trigger the events but the Floater will use the **target** prop to position itself.

```jsx
<div className="App">
    <img src="some-path" />

    <Floater
      content="This is the Floater content"
      target=".App img"
    >
        <span>click me</span>
    </Floater>
</div>

```

**Beacon**  
The same as the **proxy mode** but the wrapper will be positioned relative to the `target`.

```jsx
<div className="App">
    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png" width="100" className="my-super-image" />

    <Floater
        content="This is the Floater content"
        target=".my-super-image"
        wrapperOptions={{
            offset: -22,
            placement: 'top',
            position: true,
        }}
    >
    <span style={{ color: '#f04', fontSize: 34 }}>◉</span>
    </Floater>
</div>

```

**Controlled**  
When you set a boolean to the `open` prop it will enter the controlled mode and it will not respond to events.  
In this mode you don't even need to have `children`

```jsx
<div className="App">
    <img src="some-path" />
    <Floater
        content="This is the Floater content"
        open={true}
        target=".App img"
    />
</div>
```
