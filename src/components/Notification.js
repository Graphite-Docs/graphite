import React from "react";

export default () => {
  return (
    <div className="alert-message">
      <p>Graphite will update to SSL for enhanced security on Friday, February 9, 2018 at 10:00am Central Standard Time. Please <a href="/export">export your data</a> if you'd like to retain anything you've done so far in Graphite.</p>
      <a className="btn" onClick={this.handleClick}>Close message</a>
    </div>
  );
};
