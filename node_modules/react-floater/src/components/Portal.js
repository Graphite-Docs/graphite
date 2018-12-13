import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { canUseDOM, isReact16 } from '../utils';

export default class Portal extends React.Component {
  constructor(props) {
    super(props);

    if (!canUseDOM) return;

    this.node = document.createElement('div');
    if (props.id) {
      this.node.id = props.id;
    }

    document.body.appendChild(this.node);
  }

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
    hasChildren: PropTypes.bool,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    placement: PropTypes.string,
    setRef: PropTypes.func.isRequired,
    target: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
  };

  componentDidMount() {
    if (!canUseDOM) return;

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentDidUpdate() {
    if (!canUseDOM) return;

    if (!isReact16) {
      this.renderPortal();
    }
  }

  componentWillUnmount() {
    if (!canUseDOM || !this.node) return;

    if (!isReact16) {
      ReactDOM.unmountComponentAtNode(this.node);
    }

    document.body.removeChild(this.node);
  }

  renderPortal() {
    if (!canUseDOM) return null;

    const { children, setRef } = this.props;

    /* istanbul ignore else */
    if (isReact16) {
      return ReactDOM.createPortal(
        children,
        this.node,
      );
    }

    const portal = ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      children.length > 1 ? <div>{children}</div> : children[0],
      this.node,
    );

    setRef(portal);

    return null;
  }

  renderReact16() {
    const { hasChildren, placement, target } = this.props;

    if (!hasChildren) {
      if ((target || placement === 'center')) {
        return this.renderPortal();
      }

      return null;
    }

    return this.renderPortal();
  }

  render() {
    if (!isReact16) {
      return null;
    }

    return this.renderReact16();
  }
}
