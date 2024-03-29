export const checkImageResolution = (
  imageWidth: number,
  imageHeight: number
): string => {
  const aspectRatioCloseToStandard =
    Math.abs(imageWidth / imageHeight - 16 / 9) < 0.1

  if (
    imageWidth >= 15360 &&
    imageHeight >= 8640 &&
    aspectRatioCloseToStandard
  ) {
    return '16K'
  } else if (
    imageWidth >= 12288 &&
    imageHeight >= 6480 &&
    aspectRatioCloseToStandard
  ) {
    return '12K'
  } else if (imageWidth >= 10240 && imageHeight >= 4320) {
    return '10K'
  } else if (
    imageWidth >= 7680 &&
    imageHeight >= 4320 &&
    aspectRatioCloseToStandard
  ) {
    return '8K UHD'
  } else if (
    imageWidth >= 5120 &&
    imageHeight >= 2880 &&
    aspectRatioCloseToStandard
  ) {
    return '5K'
  } else if (
    imageWidth >= 3840 &&
    imageHeight >= 2160 &&
    aspectRatioCloseToStandard
  ) {
    return '4K UHD'
  } else if (
    imageWidth >= 2560 &&
    imageHeight >= 1440 &&
    aspectRatioCloseToStandard
  ) {
    return '2K QHD'
  } else if (
    imageWidth >= 1920 &&
    imageHeight >= 1080 &&
    aspectRatioCloseToStandard
  ) {
    return 'FHD'
  } else if (
    imageWidth >= 1280 &&
    imageHeight >= 720 &&
    aspectRatioCloseToStandard
  ) {
    return 'HD'
  } else {
    return 'Standard'
  }
}
