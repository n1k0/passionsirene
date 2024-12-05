require("dotenv/config");

const { createRestAPIClient } = require("masto");

if (!process.env.URL) {
  throw new Error("URL is missing");
}
if (!process.env.TOKEN) {
  throw new Error("TOKEN is missing");
}

const client = createRestAPIClient({
  url: process.env.URL,
  accessToken: process.env.TOKEN,
});

async function createToot(params, retries = 3, backoff = 500) {
  const retryCodes = [408, 500, 502, 503, 504, 522, 524];
  try {
    return client.v1.statuses.create(params);
  } catch (err) {
    console.warn(err.message);
    if (retries > 0 && retryCodes.includes(err.statusCode || 503)) {
      setTimeout(() => {
        return createToot(params, retries - 1, backoff * 2);
      }, backoff);
    } else {
      throw err;
    }
  }
}

function isFirstWednesdayOfMonth(date) {
  return date.getDate() <= 7 && date.getDay() === 3;
}

function randLength(letter, min = 4, max = 20) {
  return new Array(min + Math.ceil(Math.random() * (max - min)))
    .fill(undefined)
    .map(() => letter)
    .join("");
}

function ahuu() {
  return randLength("A") + randLength("H") + randLength("U");
}

async function run(force = false) {
  const today = new Date();
  if (isFirstWednesdayOfMonth(today) || force) {
    const { url } = await createToot({
      status: ahuu(),
      visibility: process.env.VISIBILITY || "direct",
    });
    console.log(`${today}: Toot successfully posted on first Wednesday of the month ${url}`);
  }
}

run();
