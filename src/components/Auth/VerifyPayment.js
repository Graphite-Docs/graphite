import React, { useEffect, useState } from "react";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { checkPaymentStatus } from "../../actions/auth";

const VerifyPayment = ({ checkPaymentStatus, auth: { paymentMade }, history }) => {
  const [paymentState, setPaymentState] = useState(null);
  useEffect(() => {
    //  Check if success or failure
    const result = window.location.href.split("/")[3];
    setPaymentState(result)
    if(result === 'success') {
      //  loadUser to verify the payment has been received
      checkPaymentStatus();
    }

    if(paymentMade) {
      history.push(`/`);
    }
    //eslint-disable-next-line
  }, [paymentMade]);

  if(paymentState === 'success') {
    return (
      <div>
        Validating payment...
      </div>
    )
  } else if(paymentState === 'canceled') {
    return (
      <div>
        You cancelled your payment or there was a problem. 
      </div>
    )
  } else {
    return <div>Processing...</div>;
  }
  
};

VerifyPayment.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { checkPaymentStatus })(VerifyPayment);
