const randomPassword = require('./index').randomPassword;

describe('passwordGenerator', () => {
  let random;

  beforeEach(() => {
    random = {
      choose: jest.fn(),
      shuffle: jest.fn(x => x),
    };
    random.choose.mockReturnValue('Q');
  });

  it('returns a string when called with no options', () => {
    var actual = randomPassword();

    expect(typeof actual).toBe('string');
  });

  it('throws an error when passed a length that is not an integer', () => {
    expect(() => randomPassword({ length: 'not-an-integer' })).toThrow('length must be an integer');
  });

  it('throws an error when passed a length less than 1', () => {
    expect(() => randomPassword({ length: 0 })).toThrow('length must be > 0');
  });

  it('throws an error when passed characters that is falsy', () => {
    const expectedError = 'Must pass one or more character sets';
    expect(() => randomPassword({ characters: null })).toThrow(expectedError);
    expect(() => randomPassword({ characters: false })).toThrow(expectedError);
    expect(() => randomPassword({ characters: 0 })).toThrow(expectedError);
  });

  it('throws an error when passed a characters set array with no items', () => {
    expect(() => randomPassword({ characters: [] })).toThrow('Must pass one or more character sets');
  });

  it('returns sequence with 1 character of given length when passed only one allowed character', () => {
    random.choose.mockImplementation(x => x);

    expect(randomPassword({
      length: 3,
      characters: 'a',
      random
    })).toBe('aaa');

    expect(randomPassword({
      length: 3,
      characters: 'b',
      random
    })).toBe('bbb');
  });

  it('returns result of random.choose on characters for length = 1', () => {
    let chooseReturnValues = {
      'abc': 'b'
    };
    random.choose.mockImplementation(arg => chooseReturnValues[arg] || '');

    let result = randomPassword({
      length: 1,
      characters: 'abc',
      random
    });

    expect(result).toBe('b');
  });

  it('returns combined string of characters returned from random.choose (for `length` many characters)', () => {
    let chooseReturnValues = {
      'abc': ['c', 'b', 'a', 'a', 'b', 'c']
    };
    random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

    let result = randomPassword({
      length: 6,
      characters: 'abc',
      random
    });

    expect(result).toBe('cbaabc');
  });

  describe('when passed multiple character sets', () => {
    it('throws an error if the passed length is fewer than the number of sets passed', () => {
      expect(() => randomPassword({
        length: 1,
        characters: ['abc', '123'],
        random
      })).toThrow('length must be >= # of character sets passed');
    });

    it('calls random.choose on each passed set once, then on a combination of all character sets for the remaining length, then shuffles the result', () => {
      let chooseReturnValues = {
        'abc': ['b'],
        '123': ['2'],
        'abc123': ['3', 'a', '2', 'b']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');
      let shuffleReturnValues = {
        'b23a2b': Array.from('b2a32b')
      };
      random.shuffle.mockImplementation(arg => shuffleReturnValues[Array.from(arg).join('')] || []);

      let result = randomPassword({
        length: 6,
        characters: ['abc', '123'],
        random
      });

      expect(result).toBe('b2a32b');
    });
  });

  describe('charcters rules', () => {
    it('accepts objects with a characters property in place of a string', () => {
      random.choose.mockImplementation(x => x);

      expect(randomPassword({
        length: 3,
        characters: { characters: 'a' },
        random
      })).toBe('aaa');
    });

    it('accepts an array of objects with a characters property in place of an array of strings', () => {
      random.choose.mockImplementation(x => x);

      expect(randomPassword({
        length: 3,
        characters: [{ characters: 'a' }],
        random
      })).toBe('aaa');
      let chooseReturnValues = {
        'abc': ['b'],
        '123': ['2'],
        'abc123': ['3', 'a', '2', 'b']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

      let result = randomPassword({
        length: 6,
        characters: [
          { characters: 'abc' },
          { characters: '123'}
        ],
        random
      });

      expect(result).toBe('b23a2b');
    });

    it('accepts an exactly property that causes the associated character set to be chosen from exactly that many times', () => {
      let chooseReturnValues = {
        'abc': ['c', 'b', 'a'],
        '123': ['3', '2', '1'],
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');
      let shuffleReturnValues = {
        'c321ba': Array.from('abc123')
      };
      random.shuffle.mockImplementation(arg => shuffleReturnValues[Array.from(arg).join('')] || []);

      let result = randomPassword({
        length: 6,
        characters: [
          'abc',
          { characters: '123', exactly: 3 }
        ],
        random
      });

      expect(result).toBe('abc123');
    });

    it('throws an error when length is less than the totaled number of exactly character sets + required sets', () => {
      expect(() => randomPassword({
        length: 42,
        characters: [
          'abc',
          { characters: '123', exactly: 42 }
        ]
      })).toThrow('length is too short for character set rules');
    });

    it('throws an error when all sets are exactly sets and they are less than length', () => {
      expect(() => randomPassword({
        length: 42,
        characters: [
          { characters: 'abc', exactly: 20 },
          { characters: '123', exactly: 21 },
        ]
      })).toThrow('Must pass a set without exactly rule to generate the specified length');
    });

    it('accepts a totaled number of exactly character sets + required sets', () => {
      expect(() => randomPassword({
        length: 10,
        characters: [
          { characters: '123', exactly: 10 }
        ]
      })).not.toThrow();

      expect(() => randomPassword({
        length: 30,
        characters: [
          { characters: '123', exactly: 10 },
          { characters: '123', exactly: 20 }
        ]
      })).not.toThrow();
    });
  });

  describe('avoidAmbiguous option', () => {
    it('accepts an avoidAmbiguous array of sets that prevents ambiguous characters from being chosen if multiple characters from any avoidAmbiguous set appear in the passed characters', () => {
      let chooseReturnValues = {
        'cd': ['c', 'd', 'c', 'd', 'c', 'd']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

      let result = randomPassword({
        length: 6,
        characters: 'abcdef',
        avoidAmbiguous: ['ab', 'ef'],
        random
      });

      expect(result).toBe('cdcdcd');
    });

    it('does not prevent characters from being chosen if only one charcter in avoidAmbiguous appears in the passed charcters', () => {
      let chooseReturnValues = {
        'abc': ['a', 'b', 'c', 'a', 'b', 'c']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

      let result = randomPassword({
        length: 6,
        characters: 'abc',
        avoidAmbiguous: ['cd'],
        random
      });

      expect(result).toBe('abcabc');
    });

    it('matches ambiguous characters across all sets', () => {
      let chooseReturnValues = {
        'b': ['b'],
        '2': ['2'],
        'b2': ['b', '2', 'b', '2']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

      let result = randomPassword({
        length: 6,
        characters: ['abc', '123'],
        avoidAmbiguous: ['a1', 'c3'],
        random
      });

      expect(result).toBe('b2b2b2');
    });

    it('throws an error if any character set is empty after excluding ambiguous characters', () => {
      expect(() => randomPassword({
        length: 42,
        characters: [
          'ab',
          'cd',
          'ef'
        ],
        avoidAmbiguous: ['cd']
      })).toThrow('No character set may be empty');

    });

    it('provides default ambiguous characters sets when true is passed for avoidAmbiguous', () => {
      random.choose.mockImplementation(x => x);

      let result = randomPassword({
        length: 6,
        characters: 'aIl1|O0',
        avoidAmbiguous: true,
        random
      });

      expect(result).toBe('aaaaaa');
    });

    it('provides an empty ambiguous character set when false value is passed for avoidAmbiguous', () => {
      let chooseReturnValues = {
        'abc': ['a', 'b', 'c', 'a', 'b', 'c']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

      let result = randomPassword({
        length: 6,
        characters: 'abc',
        avoidAmbiguous: false,
        random
      });

      expect(result).toBe('abcabc');
    });
  });

  describe('predicate option', () => {
    it('throws an error if predicate is not a function', () => {
      expect(() => randomPassword({ predicate: null })).toThrow('predicate must be a function');
    });

    it('keeps generating passwords until they pass the predicate', () => {
      let chooseReturnValues = {
        'abc': ['a', 'b', 'c', 'a', 'b', 'c', 'c', 'b', 'a']
      };
      random.choose.mockImplementation(arg => chooseReturnValues[arg].shift() || '');

      let result = randomPassword({
        length: 3,
        characters: 'abc',
        predicate: (x => x !== 'abc'),
        random
      });

      expect(result).toBe('cba');
    });
  });
});
