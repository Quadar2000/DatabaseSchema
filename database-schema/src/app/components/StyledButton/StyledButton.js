import React from 'react';
import styled from 'styled-components';

// Definiowanie stylowanego przycisku za pomocą styled-components
const StyledButton = styled.button`
  background-color: #007BFF;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: #0056b3;
  }

  &.custom-class {
    background-color: #28a745; 
  }
`;

// const StyledButton = ({ children, className = '', ...props }) => {
//   return (
//     <StyledButtonComponent className={className} {...props}>
//       {children}
//     </StyledButtonComponent>
//   );
// };

export default StyledButton;