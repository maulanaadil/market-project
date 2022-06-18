/*!
 * unescape <https://github.com/jonschlinkert/unescape>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */


'use strict';


/**
 * Convert HTML entities to HTML characters.
 *
 * @param  {String} `str` String with HTML entities to un-escape.
 * @return {String}
 */

var unescape = module.exports = function (str) {
  if (str == null) return '';

  var re = new RegExp('(' + Object.keys(chars)
    .join('|') + ')', 'g');

  return String(str).replace(re, function (match) {
    return chars[match];
  });
};


var chars = unescape.chars = {
  '&#47;': '/',
  '&#40;': '(',
  '&#41;': ')',
  '&#35;': '#',
  '&#39;': '\'',
  '&apos;': '\'',
  '&#38;': '&',
  '&amp;': '&',
  '&#62;': '>',
  '&gt;': '>',
  '&#60;': '<',
  '&lt;': '<',
  '&#34;': '"',
  '&quot;': '"',
  '&nbsp;': ' ',
  '&#xa0;': ' ',
  '&#160;': ' ',
  '&bull;': ' ',
  '&#x2022;': ' ',
  '&#8226;': ' ',
  '&#x7de;': ' ',
  '&#2014;': ' ',
  '&#x2014;': ' ',
  '&#x2c8;': ' ',
  '&#712;': ' ',
  '&#x11b;': ' ',
  '&#283;': ' ',
  '&uuml;': ' ',
  '&#xfc;': ' ',
  '&#x252;': ' ',
  '&#x7dd;': ' ',
  '&#x2013;': ' ',
  '&#2013;': ' ',
  '&#x2019;': ' ',
  '&#xA0': ' ',
  '&#x201D;': ' ',
  '&#x201C;': ' ',
  '&#xFC': ' ',
  '&#x283': ' ',
  '&#x2C8': ' ',
  'xb': ' ',
};
