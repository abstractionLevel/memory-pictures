import React from 'react';
import { Button, Modal ,Image} from 'react-bootstrap';


const ImageModal = ({isOpen,handleModal,image}) => {

    return (
        <Modal show={isOpen} onHide={handleModal}>
            <Modal.Body>
                <Image src={image} fluid   />
            </Modal.Body>
        </Modal>
    );
};

export default ImageModal;