// switcher.js
function startSwitching() {
  const reportContainer = document.getElementById("reportContainer");
  const videoContainer = document.getElementById("videoContainer");
  const video = document.getElementById("video");
  let showVideo = false;

  reportContainer.style.display = "block";

  setInterval(async () => {
    showVideo = !showVideo;
    reportContainer.style.display = showVideo ? "none" : "block";
    videoContainer.style.display = showVideo ? "block" : "none";

    if (showVideo) {
      try {
        await video.play();
      } catch (err) {
        console.warn("Video playback failed:", err);
      }
    }
  }, 60000);
}

startSwitching();
