# Death Note Testing Guide

This document describes how to run and write tests for the Death Note: Killer Within Discord Post Generator.

## Getting Started

To run the tests, you'll need to have Node.js and npm installed on your system.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the tests:
   ```bash
   npm test
   ```

3. Run tests with coverage report:
   ```bash
   npm run test:coverage
   ```

4. Run tests in watch mode (useful during development):
   ```bash
   npm run test:watch
   ```

## Test Structure

Tests are organized in the `tests` directory with the following structure:

```
tests/
├── setup.js             # Jest setup and global mocks
├── mocks/               # Mock implementations
│   ├── fileMock.js      # Mock for file imports
│   └── styleMock.js     # Mock for style imports
├── unit/                # Unit tests
│   ├── app.test.js      # Tests for app.js
│   ├── settings.test.js # Tests for settings.js
│   └── ...
└── integration/         # Integration tests
    └── ...
```

## Writing Tests

Tests are written using Jest. Here's a basic test file example:

```javascript
describe('Module Name', () => {
  beforeEach(() => {
    // Setup code that runs before each test
  });

  afterEach(() => {
    // Cleanup code that runs after each test
  });

  test('test description', () => {
    // Test code here
    expect(someValue).toBe(expectedValue);
  });
});
```

### Mocking Dependencies

You can mock dependencies using Jest's mocking capabilities:

```javascript
// Mock a module
jest.mock('../js/someModule', () => ({
  someFunction: jest.fn(),
  someProperty: 'mocked value'
}));

// Mock a function
const originalFunction = someObject.someFunction;
someObject.someFunction = jest.fn().mockReturnValue('mocked result');

// Restore original function after tests
afterEach(() => {
  someObject.someFunction = originalFunction;
});
```

### Testing DOM Interactions

For testing DOM interactions, you can use `@testing-library/dom`:

```javascript
import { fireEvent, getByText } from '@testing-library/dom';

test('button click handler works', () => {
  // Set up the DOM
  document.body.innerHTML = '<button id="myButton">Click Me</button>';
  
  // Get the button
  const button = document.getElementById('myButton');
  
  // Add a click handler
  let clicked = false;
  button.addEventListener('click', () => {
    clicked = true;
  });
  
  // Simulate a click
  fireEvent.click(button);
  
  // Assert the click handler was called
  expect(clicked).toBe(true);
});
```

## Test Coverage

The test coverage report is generated using Jest's built-in coverage reporter. You can view the report in the browser by opening the `coverage/lcov-report/index.html` file after running `npm run test:coverage`.

## Continuous Integration

Tests are automatically run on GitHub Actions whenever you push to the repository. You can see the workflow configuration in the `.github/workflows/test.yml` file.

## Common Issues

If you encounter issues running tests, try the following:

1. Make sure all dependencies are installed by running `npm install`
2. Clear the Jest cache with `npx jest --clearCache`
3. Check the Jest configuration in  `jest.config.js`
4. Make sure your test files follow the naming convention `*.test.js`