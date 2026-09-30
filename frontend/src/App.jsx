import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Quill from 'quill';
import { QuillBinding } from 'y-quill';
import 'quill/dist/quill.snow.css';

export default function App() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.innerHTML = '';
    const editorElement = document.createElement('div');
    wrapperRef.current.append(editorElement);

    const ydoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
      'ws://localhost:1234', 
      'document-room-1', 
      ydoc
    );
    
    const ytext = ydoc.getText('quill-content');

    const editor = new Quill(editorElement, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['code-block']
        ]
      }
    });

    const binding = new QuillBinding(ytext, editor, provider.awareness);

    return () => {
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();

      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div ref={wrapperRef} style={{ height: '500px' }} />
    </div>
  );
}