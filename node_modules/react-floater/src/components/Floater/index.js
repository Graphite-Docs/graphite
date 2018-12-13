import React from 'react';
import PropTypes from 'prop-types';

import STATUS from '../../status';

import Arrow from './Arrow';
import Container from './Container';

export default class Floater extends React.Component {
  static propTypes = {
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
    ]),
    content: PropTypes.node,
    disableAnimation: PropTypes.bool.isRequired,
    footer: PropTypes.node,
    handleClick: PropTypes.func.isRequired,
    hideArrow: PropTypes.bool.isRequired,
    isPositioned: PropTypes.bool,
    open: PropTypes.bool,
    placement: PropTypes.string.isRequired,
    positionWrapper: PropTypes.bool.isRequired,
    setArrowRef: PropTypes.func.isRequired,
    setFloaterRef: PropTypes.func.isRequired,
    showCloseButton: PropTypes.bool,
    status: PropTypes.string.isRequired,
    styles: PropTypes.object.isRequired,
    title: PropTypes.node,
  };

  get floaterStyle() {
    const { disableAnimation, component, placement, hideArrow, isPositioned, status, styles } = this.props;
    const {
      arrow: { length },
      floater,
      floaterCentered,
      floaterClosing,
      floaterOpening,
      floaterWithAnimation,
      floaterWithComponent,
    } = styles;
    let element = {};

    if (!hideArrow) {
      if (placement.startsWith('top')) {
        element.padding = `0 0 ${length}px`;
      }
      else if (placement.startsWith('bottom')) {
        element.padding = `${length}px 0 0`;
      }
      else if (placement.startsWith('left')) {
        element.padding = `0 ${length}px 0 0`;
      }
      else if (placement.startsWith('right')) {
        element.padding = `0 0 0 ${length}px`;
      }
    }

    if ([STATUS.OPENING, STATUS.OPEN].includes(status)) {
      element = { ...element, ...floaterOpening };
    }

    if (status === STATUS.CLOSING) {
      element = { ...element, ...floaterClosing };
    }

    if (status === STATUS.OPEN && !disableAnimation && !isPositioned) {
      element = { ...element, ...floaterWithAnimation };
    }

    if (placement === 'center') {
      element = { ...element, ...floaterCentered };
    }

    if (component) {
      element = { ...element, ...floaterWithComponent };
    }

    return {
      ...floater,
      ...element,
    };
  }

  render() {
    const {
      component,
      handleClick: closeFn,
      hideArrow,
      setFloaterRef,
      status,
    } = this.props;

    const output = {};
    const classes = ['__floater'];

    if (component) {
      if (React.isValidElement(component)) {
        output.content = React.cloneElement(component, { closeFn });
      }
      else {
        output.content = component({ closeFn });
      }
    }
    else {
      output.content = <Container {...this.props} />;
    }

    if (status === STATUS.OPEN) {
      classes.push('__floater__open');
    }

    if (!hideArrow) {
      output.arrow = <Arrow {...this.props} />;
    }

    return (
      <div
        ref={setFloaterRef}
        className={classes.join(' ')}
        style={this.floaterStyle}
      >
        <div className="__floater__body">
          {output.content}
          {output.arrow}
        </div>
      </div>
    );
  }
}
