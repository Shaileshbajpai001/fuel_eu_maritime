/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use 'preset: "ts-jest"' as a base setup
  preset: 'ts-jest',
  
  // FIX 1: Use the recommended 'transform' block instead of deprecated 'globals'
  transform: {
    // This pattern matches all .ts and .tsx files
    '^.+\\.(ts|tsx)$': [
      'ts-jest', 
      {
        // Place ts-jest options here
        tsconfig: 'tsconfig.jest.json', // <-- Link your dedicated TS config
      },
    ],
  },
  
  // FIX 2: Essential for resolving relative imports that end in .js (as required by NodeNext)
  moduleNameMapper: {
    // Map any import that ends in .js back to its source file without the extension
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  testEnvironment: 'node',
  clearMocks: true,
  coverageProvider: 'v8',
};










// /** @type {import('ts-jest').JestConfigWithTsJest} */
// module.exports = {
//   globals: {
//     'ts-jest': {
//       tsconfig: 'tsconfig.jest.json', // <-- Link the new file here
//     },
//   },
//   // FIX: Tell Jest to treat all .ts files as ES Modules
//   // extensionsToTreatAsEsm: ['.ts', '.tsx'],
//   // FIX: This property tells Jest how to handle files ending in .js (your compiled imports)
//   moduleNameMapper: {
//     '^(\\.{1,2}/.*)\\.js$': '$1',
//   },
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   clearMocks: true,
//   coverageProvider: 'v8',
// };