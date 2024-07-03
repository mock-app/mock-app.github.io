import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import { getPublicUrl } from "./utils";
export const isCompressionSupported = () =>
  typeof WebAssembly !== "undefined" &&
  typeof SharedArrayBuffer !== "undefined";

let ffmpeg: FFmpeg | undefined;
const initFFMPEG = () => {
  if (!isCompressionSupported()) {
    return;
  }

  if (!ffmpeg) {
    ffmpeg = createFFmpeg({
      log: true,
      corePath: getPublicUrl(`ffmpeg/core/0.10.0/ffmpeg-core.js`),
    });
  }
};

export const loadFFMPEG = async () => {
  initFFMPEG();
  if (!ffmpeg) return;

  if (!ffmpeg.isLoaded()) await ffmpeg.load();
};

export const generateMusicStory = async (
  cover: File,
  audio: File,
  onProgressUpdate: (progress: number) => void
) => {
  initFFMPEG();

  if (!ffmpeg) return;

  if (!ffmpeg.isLoaded()) await ffmpeg.load();
  ffmpeg.FS("writeFile", "audio.mp3", await fetchFile(audio));
  ffmpeg.FS("writeFile", "image.jpg", await fetchFile(cover));

  ffmpeg.setLogger(({ message, type }) => {
    if (type === "fferr") {
      onProgressUpdate(
        Math.floor(
          (parseInt(
            message.match(/time=([^ ]+)/)?.[1]?.split(":")?.[2] ?? "0"
          ) /
            60) *
            100
        )
      );
    }
  });

  await ffmpeg
    .run(
      "-t",
      "59",
      "-i",
      "audio.mp3",
      "-i",
      "image.jpg",
      "-preset",
      "superfast",
      "-filter_complex",
      "[0:a]showwaves=s=540x100:mode=cline:colors=black,format=yuva420p[v];[1:v]scale=540:960[bg];[bg][v]overlay=(W-w)/2:700[outv]",
      "-map",
      "[outv]",
      "-map",
      "0:a",
      "-threads",
      "0",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-b:a",
      "360k",
      "-r:a",
      "44100",
      "-shortest",
      "-af",
      "afade=t=in:st=0:d=2,afade=t=out:st=54:d=5",
      "output.mp4"
    )
    .catch((error) => {
      window.console.log("ffmpeg command failed. error = ", error);
    });

  const data = ffmpeg.FS("readFile", "output.mp4");
  const output = new File([data.buffer], "output.mp4", { type: "video/mp4" });
  return output;
};
