const util = require('./util');

describe('assign', () => {
  it('returns first object no matter how many args passed', () => {
    let someObj = {};
    expect(util.assign(someObj, {}, {})).toBe(someObj);
  });

  it('copies properties from subsequent object into the first object', () => {
    let someObj = {
      someOriginalProp: 'herp',
    };

    util.assign(someObj, { newProp1: 'derp', newProp2: 'flerp' });

    expect(someObj).toHaveProperty('someOriginalProp', 'herp');
    expect(someObj).toHaveProperty('newProp1', 'derp');
    expect(someObj).toHaveProperty('newProp2', 'flerp');
  });

  it('overrides properties with the same name using the property from the rightmost object', () => {
    let someObj = {
      someProp: 'herp',
    };

    util.assign(someObj, { someProp: 'derp' }, { someProp: 'flerp' });

    expect(someObj).toHaveProperty('someProp', 'flerp');
  });

  it('ignores null/undefined objects passed', () => {
    let actual = util.assign({ someProp: 'herp' }, null, undefined, { someProp: 'derp' });

    expect(actual).toHaveProperty('someProp', 'derp');
  });
});

describe('intersection', () => {
  it('returns empty array when passed disjoint sets', () => {
    expect(util.intersection('abc', 'def')).toEqual([]);
  });

  it('returns the intersection when passed overlapping sets', () => {
    expect(util.intersection('xabcx', '!a@b#c$')).toEqual(['a', 'b', 'c']);
  });

  it('returns a single item when passed sets with repeating items', () => {
    expect(util.intersection('aaa', 'aaa')).toEqual(['a']);
  });
});

describe('isInteger', () => {
  it('returns false for thinigs that are not numbers', () => {
    expect(util.isInteger()).toBe(false);
    expect(util.isInteger(null)).toBe(false);
    expect(util.isInteger(false)).toBe(false);
    expect(util.isInteger('not-a-number')).toBe(false);
    expect(util.isInteger({})).toBe(false);
  });

  it('returns false for non-finite numbers', () => {
    expect(util.isInteger(NaN)).toBe(false);
    expect(util.isInteger(Infinity)).toBe(false);
  });

  it('returns false for non-integer numbers', () => {
    expect(util.isInteger(1.23)).toBe(false);
  });

  it('returns true for basic integers', () => {
    expect(util.isInteger(0)).toBe(true);
    expect(util.isInteger(42)).toBe(true);
    expect(util.isInteger(-42)).toBe(true);
  });
});

describe('isString', () => {
  it('returns false for non-string things', () => {
    expect(util.isString()).toBe(false);
    expect(util.isString(null)).toBe(false);
    expect(util.isString(false)).toBe(false);
    expect(util.isString(0)).toBe(false);
    expect(util.isString({})).toBe(false);
  });

  it('returns true for string primitives', () => {
    expect(util.isString('')).toBe(true);
    expect(util.isString('derp')).toBe(true);
  });

  it('returns true for string objects', () => {
    expect(util.isString(new String('derp'))).toBe(true);
  });
});

describe('range', () => {
  it('returns empty array when called with 0', () => {
    expect(util.range(0)).toEqual([]);
  });

  it('returns [0] when called with 1', () => {
    expect(util.range(1)).toEqual([0]);
  });

  it('returns 0, 1, ..., n-1 when called with n', () => {
    expect(util.range(12)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('repeat', () => {
  it('returns empty array when passed n=0', () => {
    expect(util.repeat('derp', 0)).toEqual([]);
  });

  it('returns an array with n repeated items when passed n', () => {
    expect(util.repeat('derp', 7)).toEqual([
      'derp',
      'derp',
      'derp',
      'derp',
      'derp',
      'derp',
      'derp',
    ]);
  });
});

describe('toArray', () => {
  it('returns an array when passed an array', () => {
    expect(util.toArray([3, 2, 1])).toEqual([3, 2, 1]);
  });

  it('converts string to an array', () => {
    expect(util.toArray('abc')).toEqual(['a', 'b', 'c']);
  });
});
