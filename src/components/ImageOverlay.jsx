import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

function ImageOverlay({ position, size, onPositionChange, onResize, nodeRef }) {
  return (
    <>
      <Draggable
        position={position}
        defaultPosition={{ x: 0, y: 0 }}
        onDrag={onPositionChange}
        bounds={"parent"}
        handle={".handle-circle"}
        // nodeRef={nodeRef}
      >
        <ResizableBox
          height={size.height}
          width={size.width}
          lockAspectRatio
          className="box"
          // ref={nodeRef}
          handle={<div className="handle-triangle" />}
          minConstraints={[50, 50]}
          maxConstraints={[300, 300]}
          draggableOpts={{ enableUserSelectHack: false }}
          onResize={onResize}
          style={{
            position: "absolute",
            top: 0,
            zIndex: 100,
            // border: "1px dashed #ccc",
          }}
          axis={"both"}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
            }}
            className="content"
          >
            <img
              src="https://picsum.photos/100"
              alt="Overlay"
              style={{ width: "100%", height: "100%" }}
            />
            <div className="handle-circle" />
          </div>
        </ResizableBox>
      </Draggable>
    </>
  );
}

export default ImageOverlay;
