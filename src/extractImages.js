const { join } = require("path");
const { writeFileSync } = require("fs")

const puppeteer = require("puppeteer");
const slugify = require("slugify");

const cliProgress = require('cli-progress');

const { IMAGE_PATH_URL, URL, TOKEN_NAME, TOKEN } = require("./settings.json");

const extractImages = async (path) => {
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    const images = [];
    const pages = { current: 1 };

    const browser = await puppeteer.launch({ headless: true });  
    const page = await browser.newPage();

    page.on('response', async response => {
        if (!response.url().includes(IMAGE_PATH_URL)) return

        const buffer = await response.buffer();
        const imagePath = join(path, `${pages.current}.png`);

        writeFileSync(imagePath, buffer);
        images.push(buffer);
    });

    await page.goto(URL);
    const cookies = await page.cookies(URL);

    const id = cookies.findIndex(cookie => cookie.name === TOKEN_NAME);
    cookies[id].value = TOKEN;

    await page.setCookie(...cookies);

    console.log("> Logging.. \n")

    await page.goto(URL, { waitUntil: "networkidle2" });
    await page.waitForResponse(response => response.url().includes(IMAGE_PATH_URL));

    console.log("> Downloading images.. \n")

    const nextButtonElement = await page.$("#right-control");
    const firstPageElement = await page.$("#page");
    const totalPagesElement = await page.$("#totalPaginas");
    const titleElement = await page.$(".footer__progress-pages");

    const title = await titleElement.evaluate(element => element.textContent);

    pages.first = await firstPageElement.evaluate(element => {
        const value = Number(element.textContent);
        return value < 0 ? -value : value;
    });
    
    pages.total = await totalPagesElement.evaluate(element => {
        return Number(element.textContent);
    });

    pages.total += pages.first - 1;

    bar.start(pages.total, pages.current);

    nextButtonElement.click();

    while (pages.current <= pages.total) {
        bar.update(pages.current);

        await page.waitForResponse(
            response => response.url().includes(IMAGE_PATH_URL)
        );

        nextButtonElement.click();
        pages.current += 1;
    }

    bar.stop();
    console.log("\n");

    const formatedTitle = slugify(title, {
        replacement: '-',
        lower: true,
        trim: true
    })

    return {
        title: formatedTitle,
        images
    }
};

module.exports = { extractImages };