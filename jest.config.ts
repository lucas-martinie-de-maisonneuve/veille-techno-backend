import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es2021',
      },
      module: {
        type: 'commonjs',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs|rxjs|typeorm|class-transformer|class-validator)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/**/*.entity.ts',
    '!src/main.ts',
    '!src/**/*.dto.ts',
    '!src/common/seeds/**',
    '!src/common/constants/**',
    '!src/config/**',
    ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

export default config;