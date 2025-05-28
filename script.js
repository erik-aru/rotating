document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("myVideo");

  document.getElementById("playBtn").addEventListener("click", () => video.play());
  document.getElementById("pauseBtn").addEventListener("click", () => video.pause());
});
