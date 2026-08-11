import { describe, it, expect } from 'vitest'
import counterReducer, { increment, decrement } from './counterSlice'

describe('counterSlice', () => {
  it('should increment', () => {
    const state = counterReducer({ value: 0 }, increment())
    expect(state.value).toBe(1)
  })

  it('should decrement', () => {
    const state = counterReducer({ value: 0 }, decrement())
    expect(state.value).toBe(-1)
  })
})
