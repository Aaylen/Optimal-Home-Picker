import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import Draggable from 'react-draggable';

const CustomDraggable = forwardRef((props, ref) => {
  const nodeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getNode: () => nodeRef.current,
  }));

  return (
    <Draggable nodeRef={nodeRef} {...props}>
      <div ref={nodeRef}>{props.children}</div>
    </Draggable>
  );
});

export default CustomDraggable;