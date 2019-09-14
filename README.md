# secure-random-password

[![Build Status](https://travis-ci.org/rackerlabs/secure-random-password.svg?branch=master)](https://travis-ci.org/rackerlabs/secure-random-password) [![codecov](https://codecov.io/gh/rackerlabs/secure-random-password/branch/master/graph/badge.svg)](https://codecov.io/gh/rackerlabs/secure-random-password) [![npm](https://img.shields.io/npm/v/secure-random-password.svg)](https://www.npmjs.com/package/secure-random-password)

__secure-random-password__ is a password generator that wraps [secure-random](https://www.npmjs.com/package/secure-random) so your passwords will be generated using a cryptographically-secure source of entropy, __whether running in the [browser](#browser-support) or Node.js__. It has support to generate passwords that meet arbitrary __complexity requirements__.

## Try It

Curious to see this library in action? Head over to the [demo site](https://www.codetinkerer.com/passwords/) and open up your developer console:

![console screenshot](https://www.codetinkerer.com/passwords/img/password-site-console.png)

All functionality can be accessed through the `secureRandomPassword` global variable. Keep reading for example usage.

## Installation

```
npm install secure-random-password
```

## Usage

First import the module. For example, in Node.js:

```javascript
> const password = require('secure-random-password');
```

(See [Browser Support](#browser-support) if you're running in a browser.)

If you just want a password:

```javascript
> password.randomPassword()
'bdnoa(Ejbkby'
```

You can specify the length and the characters used:

```javascript
> password.randomPassword({ length: 4, characters: password.digits })
'6324'
```

#### Character Sets

You can pass an array of different character sets:

```javascript
> password.randomPassword({ characters: [password.lower, password.upper, password.digits] })
'QQScLnAZHTg4'
```

The generated password is guaranteed to contain at least one character from each set.

Contrast that with combining all the sets together:

```javascript
> password.randomPassword({ characters: password.lower + password.upper + password.digits })
'ickVmBUwHTDe'
```

Notice that the password in this case happens to not have any digits in it. Subsequent calls to `randomPassword(...)`  __may__ contain digits (or lower-case/upper-case letters), but it __doesn't have to__.

#### Obligatory Character Sets

Sometimes you need at least one character from a given set in order to meet complexity requirements, but you don't really want the password to have a bunch of characters from that set.

Here's how you can generate a password with 1 upper-case letter, 1 special symbol, and the rest lower-case letters:

```javascript
> password.randomPassword({ characters: [
... { characters: password.upper, exactly: 1 },
... { characters: password.symbols, exactly: 1 },
... password.lower ] })
'nerhkn#mZxjp'
```

(This is, in fact, the default character set setting if you omit the `characters` option.)

#### Custom Character Sets

There is nothing special about `password.lower`, `password.digits`, etc.:

```javascript
> password.digits
'1234567890'
```

It's just a string that contains all the characters in that set.

You can pass in whatever characters you want:

```javascript
> password.randomPassword({ characters: 'abc' })
'cbbaacbbaaba'
```

__Security Warning__: there is currently no support for de-duplicating characters. This means you can bias the output if there are duplicate characters passed in:

```javascript
> password.randomPassword({ characters: 'aaaaaaaaaaaaaaaaaaaaaaaac' })
'aaaaaaaaacaa'
```

#### Avoid Ambiguous Characters

By default, if there are groups of characters that are easily-confused (such as `O` and `0`) in any of the passed character sets, __all such characters will never be returned__:

```javascript
> password.randomPassword({ characters: 'O0o' })
'oooooooooooo'
```

You can opt-out of this behavior by setting the `avoidAmbiguous` option:

```javascript
> password.randomPassword({ avoidAmbiguous: false, characters: 'O0o' })
'Oo00oo0O0oo0'
```

__Note__: ambiguous characters are only removed if there is more than one ambiguous character across all sets.

```javascript
> password.randomPassword({ characters: password.upper })
'OVOLRAADPMBA' // happens to contain an 'O'
> password.randomPassword({ characters: [password.upper, password.digits] })
'WG86SAH22SWB' // output will never contain an 'O' (or a '0' for that matter)
```

#### Predicate

If you need the password to meet some arbitrary complexity requirement, you can pass in a `predicate` function.

For example, here's how you would generate a password that is guaranteed not to contain the value of a `userName` variable:

```javascript
> password.randomPassword({ predicate: x => !x.includes(userName) })
'fvKr#zazokcn'
```

Be careful with using `predicate`, because it essentially works like this:

```javascript
do {
  password = tryGeneratePassword();
} while (!predicate(password));
```

It's easy to pass a `predicate` that will cause `randomPassword(...)` to take a very long time (or never return). In general, only use predicate to test a negative: "this password doesn't contain too many repeating characters", "this password doesn't contain a sequence like '123'". You get the idea.

__Example__: Say you want to generate a password with 4 letters followed by 4 digits. Don't do this:

```javascript
> password.randomPassword({
... characters: [password.lower, password.digits],
... length: 8,
... predicate: x => x.match(/[a-z]{4}[0-9]{4}/) })
'ivxx4355'
```

Instead, do this:

```javascript
> password.randomPassword({ characters: password.lower, length: 4 }) +
... password.randomPassword({ characters: password.digits, length: 4 })
'wrix9539'
```

### randomString

Passwords are used for people to prove who they are. Sometimes though we just want a key or random id. In this case, there's no reason to compromise the entropy to make the resulting string more memorable/typeable/whatever since a computer will be remembering it.

If you want a fully-random string, use the `randomString` function:

```javascript
> password.randomString()
')g3It%5$x61$qTtgqFL9'
```

It supports all the same options as the `randomPassword` function:

```javascript
> password.randomString({ length: 8 })
'!t1OP5i#'
```

## Browser Support

__secure-random-password__ is written to the ES5 standard and should run in all major browsers. There are two ways to include it:

### 1. CommonJS Support

If you're using a build system, such as Webpack, you can import the module like normal:

```javascript
const password = require('secure-random-password');
```
### 2. Browser Bundle

Alternatively, you can [download the bundle](/dist/secure-random-password.min.js) and reference it on your page:

```html
<script src="/your/js/dir/secure-random-password.min.js"></script>
```

The module is accessible via the `secureRandomPassword` global:

```javascript
> secureRandomPassword.randomPassword()
"zrTpxdktkm*p"
```

## Disclaimer

This library is released as-is. Use it at your own risk.

There is no guarantee of support. If you do run into issues though, [we'd love to hear about it](/../../issues).
