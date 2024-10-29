import React from 'react';
import styled from 'styled-components';
import StyledButton from '../StyledButton/StyledButton';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Message = styled.p`
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
`;

// const Button = styled.button`
//   padding: 8px 12px;
//   margin: 0 5px;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   &:first-child {
//     background-color: #28a745;
//     color: white;
//   }
//   &:last-child {
//     background-color: #dc3545;
//     color: white;
//   }
// `;

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <Overlay>
      <Modal>
        <Message>{message}</Message>
        <StyledButton onClick={onConfirm}>Confirm</StyledButton>
        <StyledButton onClick={onCancel}>Cancel</StyledButton>
      </Modal>
    </Overlay>
  );
};

export default ConfirmModal;