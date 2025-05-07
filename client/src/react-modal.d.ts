// src/react-modal.d.ts
declare module 'react-modal' {
    import * as React from 'react';
  
    interface Props {
      isOpen: boolean;
      onRequestClose?: () => void;
      contentLabel?: string;
      className?: string;
      overlayClassName?: string;
      children?: React.ReactNode;
      appElement?: HTMLElement | string;
      style?: any;
      [key: string]: any;
    }
  
    export default class ReactModal extends React.Component<Props> {
      static setAppElement(arg0: string) {
        throw new Error('Method not implemented.');
      }
}
  }
  