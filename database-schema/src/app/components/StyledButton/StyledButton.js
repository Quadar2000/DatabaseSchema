import React from 'react';
import './StyledButton.module.css';

const StyledButton = ({ children, className = '', ...props }) => {
  return (
    <button className={`custom-button ${className}`} {...props}>
      {children}
    </button>
  );
};

export default StyledButton;