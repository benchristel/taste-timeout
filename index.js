import {curry} from "@benchristel/taste"

const timedOut = Symbol("timedOut")

export function addTimeouts(millis, tests) {
  return tests.map(addTimeout(millis))
}

const addTimeout = curry((millis, test) => {
  if (isAsync(test.fn)) {
    return {...test, async fn() {
      await callWithTimeout(millis, test.fn)
    }}
  } else {
    return test
  }
}, "addTimeout")

async function callWithTimeout(millis, cb) {
  const result = await Promise.race([
    cb(),
    after(millis, timedOut),
  ])
  if (result === timedOut) {
    throw new Error("Timed out after " + millis + "ms")
  }
}

function isAsync(f) {
  return f[Symbol.toStringTag] === "AsyncFunction"
}

function after(millis, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), millis)
  })
}
