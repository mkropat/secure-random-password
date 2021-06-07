'use strict';

var random = require('./lib/random').default;
var sets = require('./lib/character-sets');
var util = require('./lib/util');

Object.keys(sets).forEach(function (k) {
  exports[k] = sets[k];
});

var defaultAmbiguousSets = [
  'Il1|',
  'O0'
];

function randomPassword(opts) {
  var defaults = {
    avoidAmbiguous: true,
    characters: [
      sets.lower,
      { characters: sets.upper, exactly: 1 },
      { characters: sets.symbols, exactly: 1 }
    ],
    length: 12,
    predicate: function () { return true },
    random: random,
  };
  opts = util.assign({}, defaults, opts);

  var characterRules = translateRules(opts);

  if (!util.isInteger(opts.length)) {
    throw new Error('length must be an integer');
  }
  if (opts.length < 1) {
    throw new Error('length must be > 0');
  }
  if (opts.length < characterRules.length) {
    throw new Error('length must be >= # of character sets passed');
  }
  if (characterRules.some(function (rule) { return !rule.characters })) {
    throw new Error('No character set may be empty');
  }
  if (characterRules.length === 0) {
    throw new Error('Must pass one or more character sets');
  }
  if (typeof opts.predicate !== 'function') {
    throw new Error('predicate must be a function');
  }

  var minimumLength = characterRules
    .map(function (rule) { return rule.exactly || 1 })
    .reduce(function (l, r) { return l + r }, 0);
  if (opts.length < minimumLength) {
    throw new Error('length is too short for character set rules');
  }

  var allExactly = characterRules.every(function (rule) { return rule.exactly });
  if (allExactly) {
    var exactlyLength = characterRules.reduce(function (acc, r) { return acc + r.exactly }, 0);
    if (exactlyLength !== opts.length) {
      throw new Error('Must pass a set without exactly rule to generate the specified length');
    }
  }

  var result;
  do {
    result = generatePassword(characterRules, opts.length, opts.random);
  } while (!opts.predicate(result));
  return result;
}

exports.randomPassword = randomPassword;

function generatePassword(characterRules, length, random) {
  var requiredSetsWithRepeats = characterRules
    .map(function (rule) { return rule.exactly ? util.repeat(rule.characters, rule.exactly) : [rule.characters] })
    .reduce(function (l, r) { return l.concat(r) }); // flatten back to array of strings
  var requiredChoices = requiredSetsWithRepeats
    .map(function (characters) { return random.choose(characters) });

  var fillCharcters = characterRules
    .filter(function (rule) { return !rule.exactly })
    .map(function (rule) { return rule.characters })
    .join('');
  var randomChoices = util.range(length - requiredChoices.length)
    .map(function () { return random.choose(fillCharcters) });

  var shuffled = random.shuffle(requiredChoices.concat(randomChoices));
  return shuffled.join('');
}

function translateRules(opts) {
  if (!opts.characters) {
    return [];
  }
  var result = Array.isArray(opts.characters)
    ? opts.characters
    : [opts.characters];
  result = result.map(function (x) { return util.isString(x) ? { characters: x } : x });

  var ambiguousSets = opts.avoidAmbiguous === true
    ? defaultAmbiguousSets
    : (opts.avoidAmbiguous || []);

  stripAmbiguous(result, ambiguousSets);

  return result;
}

function stripAmbiguous(characterRules, ambiguousSets) {
  var allCharacters = characterRules.map(function (rule) { return rule.characters }).join('');

  var ambiguousCharacters = ambiguousSets
    .filter(function (ambiguousSet) { return util.intersection(ambiguousSet, allCharacters).length > 1 })
    .join('');

  characterRules.forEach(function (rule) {
    rule.characters = util.toArray(rule.characters)
      .filter(function(ch) { return ambiguousCharacters.indexOf(ch) < 0 }).join('');
  });
}

function randomString(opts) {
  var defaults = {
    characters: [sets.lower, sets.upper, sets.digits, sets.symbols],
    length: 20
  };
  opts = util.assign({}, defaults, opts);

  opts.avoidAmbiguous = false; // hard override

  return randomPassword(opts);
}

exports.randomString = randomString;
