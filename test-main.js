import {suite} from "./suite.js"
import {formatTestResultsAsText, runTests, expect, is, equals} from "@benchristel/taste"
import {addTimeouts} from "./index.js"

const never = new Promise(() => {})

suite.test("addTimeouts", {
  "does not modify the original tests"() {
    async function theFunction() {}
    const tests = [
      {fn: theFunction}
    ]
    addTimeouts(1, tests)
    expect(tests[0].fn, is, theFunction)
  },

  async "fails tests that take forever"() {
    const tests = [
      {
        async fn() {
          await never
        }
      }
    ]
    const {results} = await runTests(addTimeouts(0, tests))
    expect(results[0].error.message, is, "Timed out after 0ms")
  },

  async "fails tests that take just a bit too long"() {
    const tests = [
      {
        async fn() {
          // this one will fail
          await new Promise(resolve => setTimeout(resolve, 3))
        },
      },
      {
        async fn() {
          // this one will pass
          await new Promise(resolve => setTimeout(resolve, 1))
        },
      }
    ]
    const {results} = await runTests(addTimeouts(2, tests))
    expect(
      results.map(r => r.error?.message),
      equals,
      ["Timed out after 2ms", undefined],
    )
  },

  async "doesn't time out tests that resolve in microtasks"() {
    const tests = [
      {
        async fn() {
          await Promise.resolve()
        }
      }
    ]
    const {results} = await runTests(addTimeouts(0, tests))
    expect(results[0].error, is, undefined)
  },

  async "surfaces failures that occur before `await`"() {
    const tests = [
      {
        async fn() {
          expect(1, is, 2)
          await never
        }
      }
    ]
    const {results} = await runTests(addTimeouts(0, tests))
    expect(results[0].error.expectArgs, equals, [1, is, 2])
  },

  async "surfaces failures that occur after `await`"() {
    const tests = [
      {
        async fn() {
          await Promise.resolve()
          expect(1, is, 2)
        }
      }
    ]
    const {results} = await runTests(addTimeouts(0, tests))
    expect(results[0].error.expectArgs, equals, [1, is, 2])
  },

  async "does not mess with synchronous tests"() {
    const tests = [
      {
        fn() {
          expect(1, is, 2)
        }
      },
      {
        fn() {}
      },
    ]
    const {results} = await runTests(addTimeouts(0, tests))
    expect(
      results.map(r => r.error?.expectArgs),
      equals,
      [[1, is, 2], undefined],
    )
  },
})

document.getElementById("testOutput").innerText = formatTestResultsAsText(await runTests(suite.getAllTests()))
