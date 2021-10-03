# @benchristel/taste-timeout

Add timeouts to your async [taste](https://npmjs.com/package/@benchristel/taste) tests.

## Installation

```
yarn add @benchristel/taste-timeout
```

Add this to your test-running code:

```js
import {getAllTests, runTests} from "@benchristel/taste"
import {addTimeouts} from "@benchristel/taste-timeout"

const tests = addTimeouts(50 /* milliseconds */, getAllTests())
const results = await runTests(tests)
```

The timeout is per test case. In the example above, any
async test that takes longer than 50ms will fail.
