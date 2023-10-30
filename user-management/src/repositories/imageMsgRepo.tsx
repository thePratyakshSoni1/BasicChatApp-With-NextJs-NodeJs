export function getImgUrlFromImageBuffer(imageBuffer: number[]){
    let imgBuf = Buffer.from(imageBuffer)
    let imgInBase64 = imgBuf.toString('base64')
    let imgUrl = "data:image/*; base64," + imgInBase64
    return imgUrl
}