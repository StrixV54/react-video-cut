function VideoPlayer({ videoFile }) {
  return (
    <video controls height={400}>
      <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export default VideoPlayer;
