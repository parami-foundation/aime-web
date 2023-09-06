import React from 'react';
import './InfoModal.scss';
import { Modal } from 'antd';

export interface InfoModalProps {
    image: string;
    title: string;
    description: string;
    okText: string;
    onOk: () => void;
    linkText?: string;
    onLink?: () => void;
}

function InfoModal({
    image,
    title,
    description,
    okText,
    onOk,
    linkText,
    onLink
}: InfoModalProps) {
    return <>
        <Modal
            className='info-modal'
            open
            centered
            closable={false}
            maskClosable={false}
            footer={null}
            width={328}
        >
            <div className='content-container'>
                <div className='image'>
                    <img src={image} alt='' />
                </div>
                <div className='title'>
                    {title}
                </div>
                <div className='description'>
                    {description}
                </div>
                <div className='ok-btn' onClick={() => onOk()}>
                    {okText}
                </div>
                {linkText && onLink && <>
                    <div className='link-btn' onClick={() => onLink()}>
                        {linkText}
                    </div>
                </>}
            </div>
        </Modal>
    </>;
};

export default InfoModal;
