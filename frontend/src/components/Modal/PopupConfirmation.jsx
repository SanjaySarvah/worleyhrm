import React from "react";
import { Modal, Button } from "react-bootstrap";

const PopupConfirmation = ({ show, message, type, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{type === "success" ? "Success" : "Error"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={type === "success" ? "success" : "danger"} onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PopupConfirmation;
