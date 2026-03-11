# LibheifJsAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## HEIC/HEIF Sample Files

You can find sample HEIC/HEIF files for testing here:
[https://heic.digital/samples/](https://heic.digital/samples/)

## Project Structure

- `src/components/` — UI components
- `src/services/` — Angular services (decoding, monitor, etc.)
- `src/workers/` — Web worker scripts
- `src/utils/` — Utility functions

## Decoding Variants

This app supports multiple HEIF decode variants:

- **Main Thread (asm.js):** Synchronous decode, blocks JS thread
- **WASM Thread:** Synchronous decode using WebAssembly
- **Worker (asm.js):** Background decode using module worker

Switch between variants using the tabs in the UI.

## Thread Monitor

A built-in monitor shows JS main thread responsiveness during decoding. Watch for spikes or freezes when running main-thread decode.

## File Info Display

After decoding, the app shows:

- Original file size
- Converted PNG size
- Conversion time

## Useful Commands

- `ng serve` — Start dev server
- `ng build` — Build for production
- `ng test` — Run unit tests

## .gitignore

See `.gitignore` for excluded files and folders (node_modules, build outputs, bundles, etc).

## License

MIT
