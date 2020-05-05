/*
 
 @Author Anwar on 22/11/2018.
 @Project Assignment-05
 
 */


'use strict';
const sharp = require('sharp');

const doResize = (pathToFile, width, newPath, next) => {
  sharp(pathToFile)
  .resize(width)
  .toFile(newPath)
  .then(() => {
    console.log('Resize OK');
    next();
  }).catch(err => {
    console.log(err)
  });
};

module.exports = {
  doResize: doResize,
};