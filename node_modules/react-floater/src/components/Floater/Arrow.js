import React from 'react';
import PropTypes from 'prop-types';

export default class Arrow extends React.Component {
  static propTypes = {
    placement: PropTypes.string.isRequired,
    setArrowRef: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired,
  };

  get parentStyle() {
    const { placement, styles } = this.props;
    const { length } = styles.arrow;
    const arrow = {
      position: 'absolute',
    };

    /* istanbul ignore else */
    if (placement.startsWith('top')) {
      arrow.bottom = 0;
      arrow.left = 0;
      arrow.right = 0;
      arrow.height = length;
    }
    else if (placement.startsWith('bottom')) {
      arrow.left = 0;
      arrow.right = 0;
      arrow.top = 0;
      arrow.height = length;
    }
    else if (placement.startsWith('left')) {
      arrow.right = 0;
      arrow.top = 0;
      arrow.bottom = 0;
    }
    else if (placement.startsWith('right')) {
      arrow.left = 0;
      arrow.top = 0;
    }

    return arrow;
  }

  render() {
    const { placement, setArrowRef, styles } = this.props;
    const { arrow: { color, display, length, position, spread } } = styles;
    const arrowStyles = { display, position };

    let points;
    let x = spread;
    let y = length;

    /* istanbul ignore else */
    if (placement.startsWith('top')) {
      points = `0,0 ${x / 2},${y} ${x},0`;
      arrowStyles.bottom = 0;
    }
    else if (placement.startsWith('bottom')) {
      points = `${x},${y} ${x / 2},0 0,${y}`;
      arrowStyles.top = 0;
    }
    else if (placement.startsWith('left')) {
      y = spread;
      x = length;
      points = `0,0 ${x},${y / 2} 0,${y}`;
      arrowStyles.right = 0;
    }
    else if (placement.startsWith('right')) {
      y = spread;
      x = length;
      points = `${x},${y} ${x},0 0,${y / 2}`;
      arrowStyles.left = 0;
    }

    return (
      <div
        className="__floater__arrow"
        style={this.parentStyle}
      >
        <span ref={setArrowRef} style={arrowStyles}>
          <svg
            width={x}
            height={y}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points={points} fill={color} />
          </svg>
        </span>
      </div>
    );
  }
}
