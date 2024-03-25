import { useRef, useState } from "react";
import Dropzone from "react-dropzone";
import ImageOverlay from "./components/ImageOverlay";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import VideoPlayer from "./components/VideoPlayer";
import { ResizableBox } from "react-resizable";

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const [videoResolution, setVideoResolution] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const nodeRef = useRef(null);

  const handleVideoDrop = (files) => {
    const file = files[0];
    setVideoFile(file);

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);

    // console.log(videoPlayerRef.current.clientWidth, videoPlayerRef.current.clientHeight);
    video.addEventListener("loadedmetadata", () => {
      setVideoResolution({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    });
  };

  const handleImagePositionChange = (e, ui) => {
    setImagePosition({ x: ui.x, y: ui.y });
  };

  const handleImageResize = (event, { element, size }) => {
    setImageSize({
      width: size.width,
      height: size.height,
    });
  };

  console.log("Image", imagePosition);
  console.log(
    "Player",
    videoPlayerRef?.current?.clientWidth,
    videoPlayerRef?.current?.clientHeight
  );
  console.log("video", videoResolution);

  const processVideo = async () => {
    setIsProcessing(true);
    let positionReal = {
      x: Math.round(
        (videoResolution?.width * imagePosition?.x) /
          videoPlayerRef?.current?.clientWidth
      ),
      y: Math.round(
        (videoResolution?.height * imagePosition?.y) /
          videoPlayerRef?.current?.clientHeight
      ),
    };

    // console.log(positionReal);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("progress", ({ progress, time }) => {
      messageRef.current.innerHTML = `${progress * 100} % (transcoded time: ${
        time / 1000000
      } s)`;
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    await ffmpeg.writeFile("video.mp4", await fetchFile(videoFile));
    await ffmpeg.writeFile(
      "image.png",
      await fetchFile("https://picsum.photos/100")
    );

    const imageModifiedSize = `${imageSize.width}:${imageSize.height}`;
    console.log(imageModifiedSize);

    await ffmpeg.exec([
      "-i",
      "video.mp4",
      "-i",
      "image.png",
      // "-vf",
      // `scale=${imageModifiedSize}`,
      "-filter_complex",
      `overlay=${positionReal.x}:${positionReal.y}`,
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "modified_video.mp4";
    a.click();
    URL.revokeObjectURL(url);
    setIsProcessing(false);
  };

  return (
    <div className="container">
      <h1>Video Editor</h1>
      <div>
        <Dropzone onDrop={handleVideoDrop}>
          {({ getRootProps, getInputProps }) => (
            <section style={{ cursor: "pointer" }}>
              <div {...getRootProps()} className="dropbox">
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      </div>
      {videoFile && (
        <div>
          <div className="video-container" ref={videoPlayerRef}>
            <VideoPlayer videoFile={videoFile} />
            <ImageOverlay
              position={imagePosition}
              size={imageSize}
              onPositionChange={handleImagePositionChange}
              onResize={handleImageResize}
              nodeRef={nodeRef}
            />
            {/* <ResizableBox
              className="box"
              height={200}
              width={200}
              lockAspectRatio
              axis="both"
            >
              <div>Hello</div>
            </ResizableBox> */}
          </div>
          <button onClick={processVideo} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Download Modified Video"}
          </button>
          <p ref={messageRef}></p>
        </div>
      )}
    </div>
  );
}

export default App;
