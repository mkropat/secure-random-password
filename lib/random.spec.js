const Random = require('./random').Random;

describe('Random', () => {
  let randomSource;
  let subject;

  beforeEach(() => {
    randomSource = jest.fn();
    subject = new Random(randomSource);
  });

  it('throws an error when not passed a function', () => {
    expect(() => new Random(123)).toThrow('Must pass a randomSource function');
  });

  describe('getInt', () => {
    it('throws an error when not passed an upper bound', () => {
      expect(() => subject.getInt()).toThrow('Must pass an upper bound');
    });

    it('throws an error when upper bound is not a number', () => {
      expect(() => subject.getInt('derp')).toThrow('Upper bound must be a number');
    });

    it('throws an error when upper bound is less than 1', () => {
      expect(() => subject.getInt(0)).toThrow('Upper bound must be > 0');
    });

    it('does not call randomSource when called with an upper bound of 1', () => {
      expect(subject.getInt(1)).toBe(0);
      expect(randomSource).not.toHaveBeenCalled();
    });

    it('returns the result of randomSource(1) when upper bound is 2^8', () => {
      let randomValues = [123];
      randomSource.mockImplementation(n => randomValues.splice(0, n));

      expect(subject.getInt(Math.pow(2, 8))).toBe(123);
    });

    it('returns the integer value of randomSource(4) when upper bound is 2^32', () => {
      testCase([123, 45, 67, 89], 123*256*256*256 + 45*256*256 + 67*256 + 89);
      testCase([0, 0, 0, 0], 0);
      testCase([1, 0, 0, 0], Math.pow(2, 24));
      testCase([255, 255, 255, 255], Math.pow(2, 32) - 1);

      function testCase(randomValues, expected) {
        randomSource.mockImplementation(n => randomValues.splice(0, n));

        expect(subject.getInt(Math.pow(2, 32))).toBe(expected);
      }
    });

    it('returns the value of randomSource modulo the upper bound', () => {
      let randomValues = [123];
      randomSource.mockImplementation(n => randomValues.splice(0, n));

      expect(subject.getInt(100)).toBe(23);
    });

    it('keeps calling randomSource until the modulo is unbiased', () => {
      testCase(100, [234, 234, 123], 23);
      testCase(100, [199], 99);
      testCase(100, [200, 123], 23);
      testCase(256, [255], 255);
      testCase(128, [255], 127);

      function testCase(upperBound, randomValues, expected) {
        randomSource.mockImplementation(n => randomValues.splice(0, n));

        expect(subject.getInt(upperBound)).toBe(expected);
      }
    });

  });

  describe('choose', () => {

    it('throws an error when no choices are passed', () => {
      testCase(null);
      testCase('');
      testCase([]);

      function testCase(choices) {
        expect(() => subject.choose(choices)).toThrow('Must pass 1 or more choices');
      }
    });

    it('returns the choice at the index returned by _getInt(choices.length)', () => {
      let randomValues = [1];
      randomSource.mockImplementation(n => randomValues.splice(0, n));

      let getIntReturnValues = {
        ['abc'.length]: 1
      };
      jest.spyOn(subject, '_getInt').mockImplementation(n => getIntReturnValues[n]);

      expect(subject.choose('abc')).toBe('b');
    });

  });

  describe('shuffle', () => {

    it('returns an empty array when passed nothing', () => {
      expect(subject.shuffle()).toEqual([]);
    });

    it('does not modify the passed items array', () => {
      let someItems = [1, 2, 3];

      subject.shuffle(someItems);

      expect(someItems).toEqual([1, 2, 3]);
    });

    it('returns the single item if there is only 1', () => {
      let singleItem = ['a'];

      expect(subject.shuffle(singleItem)).toEqual(['a']);
    });

    it('shuffles items by getting the order from calling _getInt', () => {
      let getIntReturnValues = {
        4: 1, // a _b_ cd
        3: 2, // ac _d_
        2: 0, // _a_ c
        1: 0  // _c_
      };
      jest.spyOn(subject, '_getInt').mockImplementation(n => getIntReturnValues[n]);

      let someItems = ['a', 'b', 'c', 'd'];
      expect(subject.shuffle(someItems)).toEqual(['b', 'd', 'a', 'c']);
    });

  });
});
