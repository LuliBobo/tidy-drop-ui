# TypeScript Error Samples for DropTidy

This directory contains sample TypeScript errors and their analysis for documentation purposes.

## Error Categories

### [Import Errors](./import-errors/)

Errors related to importing modules that are available in Node.js/Electron but not in the web browser.

Example files:

- [electron-import.ts](./import-errors/electron-import.ts)
- [fs-module-import.ts](./import-errors/fs-module-import.ts)

[View detailed analysis](./import-errors/README.md)

### [Type Mismatches](./type-mismatches/)

Type compatibility issues that frequently occur in cross-platform environments.

Example files:

- [platform-specific-props.tsx](./type-mismatches/platform-specific-props.tsx)
- [boolean-string-conversion.ts](./type-mismatches/boolean-string-conversion.ts)

[View detailed analysis](./type-mismatches/README.md)

### [Missing Interfaces](./missing-interfaces/)

Errors that occur when interfaces are incomplete for web or electron versions.

Example files:

- [incomplete-interface.ts](./missing-interfaces/incomplete-interface.ts)

[View detailed analysis](./missing-interfaces/README.md)

### [Platform-specific APIs](./platform-specific-apis/)

Errors when using APIs that are only available on specific platforms.

Example files:

- [menu-creation.ts](./platform-specific-apis/menu-creation.ts)
- [navigator-api.ts](./platform-specific-apis/navigator-api.ts)

[View detailed analysis](./platform-specific-apis/README.md)

## Using These Samples

These samples demonstrate common TypeScript errors encountered when adapting an Electron application for web deployment. Each category includes:

- Example TypeScript files that produce errors
- Raw TypeScript error output
- Analysis of error patterns and suggestions
- Interactive HTML visualization of errors
- Recommendations for fixing each type of error

Use these examples to understand common error patterns and how to address them in your own code.
