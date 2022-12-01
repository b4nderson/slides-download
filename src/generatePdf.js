
const { createWriteStream } = require("fs");

const imagesToPDF = require("image-to-pdf");

const generatePdf = (images, outputPath) => new Promise((resolve, reject) => {
    console.log("> Creating PDF.. \n");

    imagesToPDF(images, imagesToPDF.sizes.A3)
        .pipe(createWriteStream(outputPath))
        .on("finish", () => {
            resolve();
        })
})

module.exports = { generatePdf };