#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ChromeExtension = require("crx");

const crx = new ChromeExtension({
  codebase: "https://simple-tv.netlify.app/ext/tv_helper.crx",
  privateKey: fs.readFileSync(path.resolve(__dirname, "./key.pem")),
});

crx
  .load(path.resolve(__dirname, "../public/ext/"))
  .then((crx) => crx.pack())
  .then((crxBuffer) => {
    const updateXML = crx.generateUpdateXML();

    fs.writeFileSync(path.resolve(__dirname, "../dist/ext/update.xml"), updateXML);
    fs.writeFileSync(path.resolve(__dirname, "../dist/ext/tv_helper.crx"), crxBuffer);
  })
  .catch((err) => {
    console.error(err);
  });
