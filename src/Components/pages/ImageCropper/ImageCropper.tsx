import React, { useCallback, useState } from "react";
import { useRef } from "react";
import download from "downloadjs";
import { toJpeg } from "html-to-image";
import "react-image-crop/dist/ReactCrop.css";
import styles from "./imageCropper.module.scss";
import { MdDelete, MdCrop } from "react-icons/Md";
import { canvasPreview } from "./Crop/canvasPreview";
import { useDebounceEffect } from "./Crop/useDebounceEffect";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import Image from "next/image";

interface Image {
  url: string;
  name: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropper: React.FC = () => {
  const imgRef = useRef<any>(null);
  const previewCanvasRef = useRef<any>();

  const [scale, setScale] = useState(1);
  const [crop, setCrop] = useState<any>();
  const [rotate, setRotate] = useState(0);
  const [imgSrc, setImgSrc] = useState("");
  const [showCrop, setShowCrop] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [imageforCrop, setImageForCrop] = useState<Image[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<any>(0);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: any = e.target.files;
    const array2: any = Array.from(imageforCrop);
    const array1: any = Array.from(files);
    const mergedArray = [...array2, ...array1];

    setImageForCrop(mergedArray);

    if (files) {
      const imagesArray: Image[] = Array.from(files).reduce(
        (acc: Image[], file: any) => {
          if (
            !images.some((image) => image.url === URL.createObjectURL(file))
          ) {
            acc.push({
              url: URL.createObjectURL(file),
              name: file.name,
            });
          }
          return acc;
        },
        []
      );
      setImages(images.concat(imagesArray));
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const onDownloadCropClick = useCallback(async () => {
    if (previewCanvasRef.current) {
      download(await toJpeg(previewCanvasRef.current), "my-image.png");
    }
  }, [previewCanvasRef?.current]);

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else if (imgRef.current) {
      const { width, height } = imgRef.current;
      setAspect(16 / 9);
      setCrop(centerAspectCrop(width, height, 16 / 9));
    }
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowCrop(false);
    setCompletedCrop(undefined);
  };

  const handleRemoveImg = () => {
    const data: any = images[selectedImageIndex].name;
    setImages((preValue) => preValue.filter((img: any) => img.name !== data));
  };

  const handleCropImage = () => {
    // setCrop(undefined); // Makes crop preview update between images.
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setImgSrc(reader.result?.toString() || "")
    );
    const img: any = imageforCrop[selectedImageIndex];
    reader?.readAsDataURL(img);
    setShowCrop(true);
  };

  const handleCancel = () => {
    setSelectedImageIndex(0);
    setShowCrop(false);
    setCompletedCrop(undefined);
  };

  return (
    <>
      <div className={styles.imageUploadWrapper}>
        <div className={styles.fileButtonOuter}>
          <div className={styles.fileButton}>
            <input
              type="file"
              className={styles.input}
              multiple
              onChange={handleImageUpload}
            />
            Upload Image
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.sidebar}>
            {images?.map((image, index) => (
              <div
                key={image.name}
                className={`${styles.thumbnail} ${
                  index === selectedImageIndex ? styles.active : ""
                }`}
                onClick={() => handleImageClick(index)}
              >
                <img src={image.url} alt={image.name} />
              </div>
            ))}
          </div>
          {images.length > 0 && (
            <div className={styles.previewAlignment}>
              <div className={styles.preview}>
                <div className={styles.previewWrapper}>
                  <div onClick={handleRemoveImg}>
                    <MdDelete size={30} />
                  </div>
                  <div onClick={() => handleCropImage()}>
                    <MdCrop size={30} />
                  </div>
                  {showCrop && (
                    <div onClick={() => handleCropImage()}>
                      <button onClick={handleToggleAspectClick}>
                        Toggle aspect {aspect ? "off" : "on"}
                      </button>
                    </div>
                  )}
                </div>
                {showCrop === false ? (
                  selectedImageIndex !== null && (
                    <Image
                      src={images[selectedImageIndex]?.url}
                      alt={images[selectedImageIndex]?.name}
                      width={100}
                      height={100}
                    />
                  )
                ) : (
                  <>
                    {!!imgSrc && (
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={imgSrc}
                          style={{
                            transform: `scale(${scale}) rotate(${rotate}deg)`,
                          }}
                          onLoad={onImageLoad}
                        />
                      </ReactCrop>
                    )}
                  </>
                )}
              </div>
              <div className={styles.cropedImage}>
                {" "}
                {!!completedCrop && (
                  <div className={styles.cropImageAlignment}>
                    <canvas id="canvas" ref={previewCanvasRef} />
                    <div className={styles.btnAlignment}>
                      <button
                        onClick={onDownloadCropClick}
                        className={styles.button}
                      >
                        Download Crop
                      </button>
                      <button className={styles.button} onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageCropper;
