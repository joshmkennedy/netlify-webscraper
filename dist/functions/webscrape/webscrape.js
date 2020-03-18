const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
const chalk = require("chalk");
const error = chalk.bold.red;
const success = chalk.keyword("green");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const url = body.url;
  var browser;
  try {
    console.log(url);
    // open the headless browser
    browser = await puppeteer.launch({
      // Required
      executablePath: await chromium.executablePath,

      // Optional
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless
    });
    // open a new page
    var page = await browser.newPage();
    // enter url in page
    await page.goto(url);
    await page.waitForSelector("title");

    var news = await page.evaluate(() => {
      const title = document
        .querySelector("meta[property='og:title']")
        .getAttribute("content")
        .trim();
      const link = window.location.href;
      const description = document
        .querySelector('meta[property="og:description"]')
        .getAttribute("content")
        .trim();
      const image = document
        .querySelector("meta[property='og:image']")
        .getAttribute("content")
        .trim();
      const hostParts = window.location.host.split(".");
      const hostLength = hostParts.length;
      const siteTitle = hostParts[hostLength - 2];
      return { title, image, link, description, siteTitle };
    });
    // console.log(news);
    await browser.close();
    // Writing the news inside a json file
    console.log(success("Browser Closed"));
    return {
      statusCode: 200,
      body: url
    };
  } catch (err) {
    // Catch and display errors
    console.log(error(err));
    await browser.close();
    return {
      statusCode: 200,
      body: JSON.stringify(err)
    };
    console.log(error("Browser Closed"));
  }
};
