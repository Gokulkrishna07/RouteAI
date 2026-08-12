import { describe, expect, it } from 'vitest'
import {
  AUTH_VALIDATION_MESSAGES,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './auth.constants'
import {
  toFullName,
  validateEmail,
  validateLoginForm,
  validateName,
  validatePassword,
  validateSignupForm,
} from './auth.validation'

const VALID_EMAIL = 'john@example.com'
const VALID_PASSWORD = 'a'.repeat(PASSWORD_MIN_LENGTH)

describe('validateEmail', () => {
  it('accepts a well-formed address', () => {
    expect(validateEmail(VALID_EMAIL)).toBeUndefined()
  })

  it.each([
    'first.last+tag@sub.example.co.uk',
    'UPPER@EXAMPLE.COM',
    "o'brien@example.com",
  ])('accepts %s', (email) => {
    expect(validateEmail(email)).toBeUndefined()
  })

  it('ignores surrounding whitespace', () => {
    expect(validateEmail(`  ${VALID_EMAIL}  `)).toBeUndefined()
  })

  it.each(['', '   ', '\t'])('rejects blank input %j', (email) => {
    expect(validateEmail(email)).toBe(AUTH_VALIDATION_MESSAGES.emailRequired)
  })

  it.each([
    'john',
    'john@',
    '@example.com',
    'john@example',
    'john@example.c',
    'john doe@example.com',
    'john@@example.com',
    'john@exa mple.com',
  ])('rejects malformed address %j', (email) => {
    expect(validateEmail(email)).toBe(AUTH_VALIDATION_MESSAGES.emailInvalid)
  })

  it('accepts an address exactly at the length limit', () => {
    const local = 'a'.repeat(EMAIL_MAX_LENGTH - '@example.com'.length)
    expect(validateEmail(`${local}@example.com`)).toBeUndefined()
  })

  it('rejects an address one character over the length limit', () => {
    const local = 'a'.repeat(EMAIL_MAX_LENGTH - '@example.com'.length + 1)
    expect(validateEmail(`${local}@example.com`)).toBe(AUTH_VALIDATION_MESSAGES.emailTooLong)
  })
})

describe('validatePassword', () => {
  it('accepts a password at the minimum length', () => {
    expect(validatePassword(VALID_PASSWORD)).toBeUndefined()
  })

  it('accepts a password at the maximum length', () => {
    expect(validatePassword('a'.repeat(PASSWORD_MAX_LENGTH))).toBeUndefined()
  })

  it('rejects an empty password', () => {
    expect(validatePassword('')).toBe(AUTH_VALIDATION_MESSAGES.passwordRequired)
  })

  it('rejects a password one character under the minimum', () => {
    expect(validatePassword('a'.repeat(PASSWORD_MIN_LENGTH - 1))).toBe(
      AUTH_VALIDATION_MESSAGES.passwordTooShort,
    )
  })

  it('rejects a password one character over the maximum', () => {
    expect(validatePassword('a'.repeat(PASSWORD_MAX_LENGTH + 1))).toBe(
      AUTH_VALIDATION_MESSAGES.passwordTooLong,
    )
  })

  it('does not trim — whitespace counts toward the length', () => {
    expect(validatePassword(' '.repeat(PASSWORD_MIN_LENGTH))).toBeUndefined()
  })
})

describe('validateName', () => {
  it('accepts a name at the minimum length', () => {
    expect(validateName('a'.repeat(NAME_MIN_LENGTH))).toBeUndefined()
  })

  it('accepts a name at the maximum length', () => {
    expect(validateName('a'.repeat(NAME_MAX_LENGTH))).toBeUndefined()
  })

  it.each(['', '   '])('rejects blank input %j', (name) => {
    expect(validateName(name)).toBe(AUTH_VALIDATION_MESSAGES.nameRequired)
  })

  it('rejects a name shorter than the minimum', () => {
    expect(validateName('a')).toBe(AUTH_VALIDATION_MESSAGES.nameTooShort)
  })

  it('rejects a name longer than the maximum', () => {
    expect(validateName('a'.repeat(NAME_MAX_LENGTH + 1))).toBe(
      AUTH_VALIDATION_MESSAGES.nameTooLong,
    )
  })
})

describe('toFullName', () => {
  it.each([
    [['John', 'Francisco'], 'John Francisco'],
    [['  John  ', '  Francisco  '], 'John Francisco'],
    [['John', ''], 'John'],
    [['', 'Francisco'], 'Francisco'],
    [['', ''], ''],
    [['   ', '   '], ''],
  ] as const)('joins %j into %j', ([first, last], expected) => {
    expect(toFullName(first, last)).toBe(expected)
  })
})

describe('validateLoginForm', () => {
  it('returns no errors for valid values', () => {
    expect(validateLoginForm({ email: VALID_EMAIL, password: VALID_PASSWORD })).toEqual({})
  })

  it('reports every invalid field at once', () => {
    expect(validateLoginForm({ email: 'nope', password: '' })).toEqual({
      email: AUTH_VALIDATION_MESSAGES.emailInvalid,
      password: AUTH_VALIDATION_MESSAGES.passwordRequired,
    })
  })

  it('omits keys for valid fields rather than setting them undefined', () => {
    const errors = validateLoginForm({ email: VALID_EMAIL, password: '' })
    expect(Object.keys(errors)).toEqual(['password'])
  })
})

describe('validateSignupForm', () => {
  const validValues = {
    firstName: 'John',
    lastName: 'Francisco',
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
  }

  it('returns no errors for valid values', () => {
    expect(validateSignupForm(validValues)).toEqual({})
  })

  it('accepts a first name only', () => {
    expect(validateSignupForm({ ...validValues, lastName: '' })).toEqual({})
  })

  it('accepts a last name only', () => {
    expect(validateSignupForm({ ...validValues, firstName: '' })).toEqual({})
  })

  it('reports a missing name on the first-name field', () => {
    expect(validateSignupForm({ ...validValues, firstName: '', lastName: '' })).toEqual({
      firstName: AUTH_VALIDATION_MESSAGES.nameRequired,
    })
  })

  it('validates the name rule against the combined value', () => {
    // 'J' + 'F' trims to 'J F' (3 chars) which clears the minimum.
    expect(validateSignupForm({ ...validValues, firstName: 'J', lastName: 'F' })).toEqual({})
    expect(validateSignupForm({ ...validValues, firstName: 'J', lastName: '' })).toEqual({
      firstName: AUTH_VALIDATION_MESSAGES.nameTooShort,
    })
  })

  it('reports every invalid field at once', () => {
    expect(
      validateSignupForm({ firstName: '', lastName: '', email: 'bad', password: 'x' }),
    ).toEqual({
      firstName: AUTH_VALIDATION_MESSAGES.nameRequired,
      email: AUTH_VALIDATION_MESSAGES.emailInvalid,
      password: AUTH_VALIDATION_MESSAGES.passwordTooShort,
    })
  })
})
