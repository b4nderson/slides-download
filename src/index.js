
const { join } = require("path");
const { exit } = require("process");
const { mkdirSync, renameSync, existsSync, rmSync } = require("fs")

const { extractImages } = require("./extractImages");
const { generatePdf } = require("./generatePdf");

const ROOT_PATH = join(__dirname, "..");
const ASSETS_PATH = join(ROOT_PATH, "assets");
const TEMP_PATH = join(ASSETS_PATH, "temp");

(async () => {
    console.log("> Starting.. \n")

    if (!existsSync(ASSETS_PATH)) mkdirSync(ASSETS_PATH);
    if (existsSync(TEMP_PATH)) rmSync(TEMP_PATH, { recursive: true });

    mkdirSync(TEMP_PATH);
    mkdirSync(join(TEMP_PATH, "images"));
    mkdirSync(join(TEMP_PATH, "pdfs"));

    const imagesPath = join(TEMP_PATH, "images");

    try {
        const { title, images } = await extractImages(imagesPath);
        await generatePdf(images, join(TEMP_PATH, "pdfs", `${title}.pdf`));

        const finalPath = join(ROOT_PATH, "assets", title)

        if (existsSync(finalPath)) rmSync(finalPath, { recursive: true });
        renameSync(TEMP_PATH, finalPath);
    } catch(error) {
        rmSync(TEMP_PATH, { recursive: true });
    } finally {
        exit(1);
    }
})();