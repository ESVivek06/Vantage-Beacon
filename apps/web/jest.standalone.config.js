const path = require('path');
const repoRoot = path.resolve(__dirname, '../..');

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '^react$': path.join(repoRoot, 'node_modules/react'),
    '^react-dom$': path.join(repoRoot, 'node_modules/react-dom'),
    '^react-dom/client$': path.join(repoRoot, 'node_modules/react-dom/client'),
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [require.resolve('babel-jest'), {
      presets: [
        [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
        [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
        require.resolve('@babel/preset-typescript'),
      ],
    }],
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};
