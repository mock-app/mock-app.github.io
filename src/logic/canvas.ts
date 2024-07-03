import ColorThief from "colorthief";
import {
  Textbox,
  Image as FabricImage,
  Rect,
  filters,
  Canvas,
} from "fabric-browserified";
import { getPublicUrl } from "./utils";

export const generateMusicCover = (
  coverSrc: string,
  title: string,
  info: string
) => {
  const canvasWidth = 360;
  const canvasHeight = (canvasWidth * 16) / 9;
  const canvasElement = document.createElement("canvas");
  const canvas = new Canvas(canvasElement, {
    backgroundColor: "black",
    width: canvasWidth,
    height: canvasHeight,
    preserveObjectStacking: true,
    selection: false,
  });
  window.console.log("ok");
  return new Promise<File>((resolve, reject) => {
    const image = new Image();
    image.src = coverSrc;
    window.console.log(coverSrc);
    image.onload = async function () {
      const cover = new FabricImage(image);
      let imgWidth = canvasWidth * 0.8;
      cover.scaleToWidth(imgWidth);
      let imgHeight = (cover.height * imgWidth) / cover.width;
      cover.set({
        left: canvasWidth / 2 - imgWidth / 2,
        top: canvasHeight * 0.15,
        clipPath: new Rect({
          left: 0,
          top: 0,
          width: image.width,
          height: image.height,
          rx: (image.width / imgWidth) * 15,
          ry: (image.width / imgHeight) * 15,
          originX: "center",
          originY: "center",
        }),
        shadow: {
          color: "rgba(0,0,0,0.7)",
          blur: 200,
          offsetX: 0,
          offsetY: 20,
        },
      });

      const name = new Textbox(
        title.length <= 22 ? title : title.slice(0, 19) + "...",
        {
          textAlign: "center",
          width: canvasWidth,
          fontSize: 24,
          editable: false,
          fontFamily: "Gilroy",
          fill: "black",
          lockUniScaling: true,
          fontWeight: "bold",
          left: 0,
          top: cover.top + imgHeight + 20,
        }
      );

      const description = new Textbox(
        info.length <= 42 ? info : info.slice(0, 39) + "...",
        {
          textAlign: "center",
          width: canvasWidth,
          fontSize: 14,
          editable: false,
          fontFamily: "Gilroy",
          fill: "black",
          lockUniScaling: true,
          fontWeight: "bold",
          left: 0,
          top: name.top + name.height,
        }
      );

      const blurredBackground = new FabricImage(image);
      blurredBackground.scaleToHeight(canvasHeight);
      imgWidth =
        (blurredBackground.width * canvasHeight) / blurredBackground.height;
      const blur = new filters.Blur({
        blur: 0.8,
      }) as any;
      blurredBackground.filters.push(blur);
      blurredBackground.applyFilters();

      const tempCanvas = new Canvas(document.createElement("canvas"), {
        backgroundColor: "red",
        width: 370,
        height: 70,
      });
      blurredBackground.set({
        left: canvasWidth / 2 - imgWidth / 2,
        top: -canvasHeight * 0.6,
      });
      tempCanvas.add(blurredBackground);
      tempCanvas.renderAll();
      const colorThief = new ColorThief();
      const tempImage = new Image();
      tempImage.src = tempCanvas.toDataURL();
      await new Promise<boolean>((resolve, reject) => {
        tempImage.onload = () => {
          resolve(isDark(...colorThief.getColor(tempImage)));
        };
      }).then((isDark) => {
        name.set({ fill: isDark ? "#f4f5f7" : "#1a1b1c" });
        description.set({ fill: isDark ? "#f4f5f7" : "#1a1b1c" });
      });

      blurredBackground.set({
        left: canvasWidth / 2 - imgWidth / 2,
        top: 0,
      });

      canvas?.add(blurredBackground, cover, name, description);
      canvas?.renderAll();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toCanvasElement(2).toBlob((blob) => {
          if (blob) resolve(blob);
          else reject();
        });
      });
      const file = new File([blob], "cover.jpg", {
        type: "image/jpeg",
      });
      resolve(file);
    };
  });
};

const isDark = (r: number, g: number, b: number) => {
  return r * 0.299 + g * 0.587 + b * 0.114 < 186;
};

export const generateBookCover = (coverSrc: string) => {
  const canvasWidth = 360;
  const canvasHeight = (canvasWidth * 16) / 9;
  const canvasElement = document.createElement("canvas");
  const canvas = new Canvas(canvasElement, {
    backgroundColor: "black",
    width: canvasWidth,
    height: canvasHeight,
    preserveObjectStacking: true,
    selection: false,
  });
  return new Promise<File>(async (resolve, reject) => {
    const bg2 = await new Promise<FabricImage>((resolve, reject) => {
      const image = new Image();
      image.src = getPublicUrl("images/book/background.jpg");
      image.crossOrigin = "anonymous";
      image.onload = async function () {
        const cover = new FabricImage(image);
        cover.scaleToWidth(canvasWidth);
        canvas?.add(cover);
        resolve(cover);
      };
    });
    const bg = await new Promise<FabricImage>((resolve, reject) => {
      const image = new Image();
      image.src = getPublicUrl("images/book/background.jpg");
      image.onload = async function () {
        const cover = new FabricImage(image);
        cover.scaleToWidth(canvasWidth);
        canvas?.add(cover);
        resolve(cover);
      };
    });
    const shadow = await new Promise<FabricImage>((resolve, reject) => {
      const image = new Image();
      image.src = getPublicUrl("images/book/plantShadow.png");
      image.onload = async function () {
        const cover = new FabricImage(image);
        cover.scaleToWidth(bg.width);
        resolve(cover);
      };
    });
    const cover = await new Promise<FabricImage>((resolve, reject) => {
      const canvasWidth = 360;
      const canvasHeight = (canvasWidth * 16) / 9;
      const canvasElement = document.createElement("canvas");
      const canvas = new Canvas(canvasElement, {
        width: canvasWidth,
        height: canvasHeight,
        preserveObjectStacking: true,
        selection: false,
      });
      const image = new Image();
      image.src = coverSrc;
      image.crossOrigin = "anonymous";
      const colorThief = new ColorThief();
      image.onload = async function () {
        const isLandscape = image.width / image.height > 267 / 378;
        if (isLandscape) {
          const rect = new Rect({
            width: 267,
            height: 378 / 2,
            top: 125,
            left: 59,
            fill: `rgb(${await getHalfImageMainColor(image)})`,
          });
          const rect2 = new Rect({
            width: 267,
            height: 378 / 2,
            top: 125 + 378 / 2,
            left: 59,
            fill: `rgb(${await getHalfImageMainColor(image, true)})`,
          });
          canvas.add(rect, rect2);
        } else {
          const rect = new Rect({
            width: 267 / 2,
            height: 378,
            top: 125,
            left: 59,
            fill: `rgb(${await getHalfImageMainColorVertical(image)})`,
          });
          const rect2 = new Rect({
            width: 267 / 2,
            height: 378,
            top: 125,
            left: 59 + 267 / 2,
            fill: `rgb(${await getHalfImageMainColorVertical(image, true)})`,
          });
          canvas.add(rect, rect2);
        }
        const cover = new FabricImage(image);
        if (isLandscape) cover.scaleToWidth(267);
        else cover.scaleToHeight(378);
        cover.set({
          top: isLandscape ? 125 + 378 / 2 - cover.getScaledHeight() / 2 : 125,
          left: isLandscape ? 59 : 59 + 267 / 2 - cover.getScaledWidth() / 2,
        });
        canvas.add(cover);
        canvas.renderAll();
        const img2 = new Image();
        const du = canvas.toDataURL();
        img2.src = du;
        img2.onload = () => {
          const cover2 = new FabricImage(img2);
          resolve(cover2);
        };
        img2.onerror = (err) => {
          console.log(err);
        };
      };
      image.onerror = function (err) {
        console.log("ok", err);
      };
    });
    bg.filters.push(
      new filters.BlendImage({
        image: cover,
        mode: "multiply",
      }) as any
    );
    bg.applyFilters();
    // const rect = new Rect({
    //   width: 267,
    //   height: 378,
    //   top: 125,
    //   left: 59,
    //   fill: "rgba(20,20,20,0.5)",
    // });
    // bg.filters.push(
    //   new filters.BlendImage({
    //     image: rect,
    //     mode: "multiply",
    //     // alpha: 0.5,
    //   }) as BaseFilter
    // );

    canvas.renderAll();
    const img3 = new Image();
    img3.src = canvas.toDataURL();
    const lastcover = await new Promise<FabricImage>((resolve, reject) => {
      img3.onload = () => {
        resolve(new FabricImage(img3));
      };
    });

    const img4 = new Image();
    img4.src = canvas.toDataURL();
    const lastcover2 = await new Promise<FabricImage>((resolve, reject) => {
      img4.onload = () => {
        resolve(new FabricImage(img3));
      };
    });
    const canvasElement = document.createElement("canvas");
    const canvas2 = new Canvas(canvasElement, {
      width: canvasWidth,
      height: canvasHeight,
      preserveObjectStacking: true,
      selection: false,
    });
    canvas2.add(lastcover2);
    canvas2.add(lastcover);

    lastcover.filters.push(
      new filters.BlendImage({
        image: shadow,
        mode: "multiply",
        // alpha: 0.5,
      }) as any
    );
    lastcover.applyFilters();
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.src = getPublicUrl("images/book/plant.png");
      image.onload = async function () {
        const plant = new FabricImage(image);
        plant.scaleToWidth(canvasWidth);
        canvas2.add(plant);
        canvas2.bringObjectToFront(plant);
        resolve();
      };
    });
    // canvas.add(rect);
    canvas2.renderAll();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas2.toCanvasElement(2).toBlob((blob) => {
        if (blob) resolve(blob);
        else reject();
      });
    });
    const file = new File([blob], "cover.jpg", {
      type: "image/jpeg",
    });
    resolve(file);
  });
};

const getImageMainColor = (imageFile: File | HTMLImageElement) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const colorThief = new ColorThief();
    if (imageFile instanceof File) {
      img.src = URL.createObjectURL(imageFile);
      img.onload = function () {
        resolve(colorThief.getColor(img).join(","));
        img.onerror = reject;
      };
    } else {
      resolve(colorThief.getColor(imageFile).join(","));
    }
  });
};

async function getHalfImageMainColor(img: HTMLImageElement, bottom?: boolean) {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 10;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(
      img,
      0,
      bottom ? img.height - 10 : 0,
      img.width,
      10,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const colorThief = new ColorThief();
    const halfImg = new Image();
    halfImg.src = canvas.toDataURL();
    halfImg.onload = () => {
      resolve(colorThief.getColor(halfImg).join(","));
    };
    halfImg.onerror = reject;
  });
}

async function getHalfImageMainColorVertical(
  img: HTMLImageElement,
  right?: boolean
) {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.height = 600;
    canvas.width = 10;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(
      img,
      right ? img.width - 10 : 0,
      0,
      10,
      img.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const colorThief = new ColorThief();
    const halfImg = new Image();
    halfImg.src = canvas.toDataURL();
    halfImg.onload = () => {
      resolve(colorThief.getColor(halfImg).join(","));
    };
    halfImg.onerror = reject;
  });
}
