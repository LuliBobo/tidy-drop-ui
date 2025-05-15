# Platform-specific APIs

Errors when using APIs that are only available on specific platforms.

## Examples


## Error Analysis

These examples demonstrate typical TypeScript errors encountered when building for web deployment.

- [View Error Log](./typescript-errors.log)
- [View Error Analysis](./typescript-analysis.json)
- [View Error Visualization](./typescript-errors-report.html)

## How to Fix

### General Approaches

1. Create facade services that provide unified APIs but different implementations
2. Use dependency injection to supply platform-specific implementations
3. Use feature detection instead of platform detection when possible
