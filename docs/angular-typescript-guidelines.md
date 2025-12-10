# Angular & TypeScript Guidelines

## Code Organization
- Keep Angular artifacts standalone-first; prefer module-less components where practical.
- Export symbols with named exports only (no `default`) to avoid ambiguous imports, following the [TypeScript style guidance](https://ts.dev/style/index).
- Align file names with the CLI pattern (`hero.component.ts`, `hero.component.scss`). Classes and components should remain in `UpperCamelCase`, as required for JSX/Angular templates in the TypeScript style guide.
- When aliasing imports, use `as` with descriptive names for clarity, e.g. `import { from as observableFrom } from 'rxjs';`.

## Formatting & Syntax
- Indent with two spaces and include trailing commas in multi-line literals. This keeps diffs minimal and matches existing code.
- Use `const` by default; fall back to `let` only when reassignment is required.
- Avoid namespaces or `require()`; rely on ES modules per the official TypeScript rules.

## Angular Testing Patterns
- Configure tests through `TestBed.configureTestingModule` (or the standalone `imports` array) and capture a `ComponentFixture<T>` to drive assertions and change detection.
- Trigger view updates with `fixture.detectChanges()` before asserting DOM state; use `fixture.whenStable()` for async flows.
- Query the rendered DOM via `fixture.nativeElement` or `fixture.debugElement` to verify responsive classes, accessibility attributes, and breakpoints.
- Keep test names imperative (`should render CTA stack on mobile`) and co-locate specs next to components (`hero.component.spec.ts`).

## Signals, Inputs, & State
- Prefer Angular Signals for lightweight view state; wrap derived selectors in `computed` functions.
- Use `input()` decorators for component inputs and apply strict types (`HeroLayoutState` interfaces from the data model).

## Documentation & Comments
- Reserve comments for explaining non-obvious layout decisions or constraint workarounds.
- Reference new tokens or mixins in `src/styles/_tokens.scss` and `_mixins.scss` inline with modifications so designers can trace dependencies.
