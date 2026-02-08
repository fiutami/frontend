# Figma Pipeline - Quick Start Guide

> Fast reference for generating Angular components from Figma designs

---

## Prerequisites

✅ Figma file ID configured: `25uQUXz6gwFQKx4Wjp0dcc`
✅ MCP server configured in Claude Desktop
✅ Component specs generated in `.figma/specs/components/`

---

## Common Commands

### Sync Design Tokens
```bash
npm run figma:sync-tokens
```
**Output**: `src/styles/_tokens-figma.scss`

### Generate Single Component
```bash
npm run figma:generate -- --component=ComponentName
```

**Examples**:
```bash
npm run figma:generate -- --component=AuthCard
npm run figma:generate -- --component=SocialLogin
npm run figma:generate -- --component=LanguageSwitcher
```

### Generate All Components
```bash
npm run figma:generate -- --all
```

### View Figma Changes
```bash
npm run figma:diff
```

---

## Available Components

### Pages (3)
- `HomeStart` - Landing page
- `Login` - Login form page
- `Signup` - Registration form page

### UI Components (5)
- `AuthCard` - Auth buttons card
- `SocialLogin` - Google/Facebook/Apple buttons
- `LanguageSwitcher` - Language dropdown
- `LogoFiutami` - Brand logo
- `BackButton` - Back navigation

---

## Component Specs Location

```
.figma/specs/components/
├── AuthCard.json
├── BackButton.json
├── HomeStart.json
├── LanguageSwitcher.json
├── Login.json
├── LogoFiutami.json
├── Signup.json
└── SocialLogin.json
```

---

## Generated File Structure

When you run `npm run figma:generate -- --component=AuthCard`, it creates:

```
src/app/auth-card/
├── auth-card.component.ts       # TypeScript component
├── auth-card.component.html     # Template
├── auth-card.component.scss     # Styles (uses tokens)
├── auth-card.component.spec.ts  # Tests
└── auth-card.module.ts          # NgModule
```

---

## Design Tokens

**Location**: `src/styles/_tokens-figma.scss` (auto-generated)

**Import in components**:
```scss
@import 'src/styles/tokens-figma';
@import 'src/styles/mixins';

.my-component {
  background-color: $color-primary-500;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
}
```

---

## Build Order (Dependencies)

Generate in this order to avoid dependency errors:

1. `LogoFiutami`
2. `BackButton`
3. `LanguageSwitcher`
4. `SocialLogin`
5. `AuthCard`
6. `HomeStart`
7. `Login`
8. `Signup`

Or use `npm run figma:generate -- --all` to auto-handle dependencies.

---

## Responsive Breakpoints

All components support:
- **Mobile**: 390-418×844px (`$breakpoint-xs`)
- **Tablet**: 768×1024px (`$breakpoint-md`)
- **Desktop**: 1440×1024px (`$breakpoint-xl`)

---

## Testing Generated Components

```bash
# Start dev server
npm start

# Run tests
npm test

# Test specific component
npm test -- --include='**/auth-card.component.spec.ts'
```

---

## Troubleshooting

### "Component spec not found"
```bash
# Verify spec exists
ls .figma/specs/components/ComponentName.json
```

### "Design tokens not found"
```bash
# Sync tokens first
npm run figma:sync-tokens
```

### "Compilation errors"
```bash
# Ensure dependencies generated first
# Check build order above
```

---

## Workflow Example

### Scenario: Add Login page to app

```bash
# Step 1: Sync tokens
npm run figma:sync-tokens

# Step 2: Generate dependencies
npm run figma:generate -- --component=LogoFiutami
npm run figma:generate -- --component=BackButton
npm run figma:generate -- --component=LanguageSwitcher
npm run figma:generate -- --component=SocialLogin

# Step 3: Generate Login page
npm run figma:generate -- --component=Login

# Step 4: Test
npm start
# Navigate to /login

# Step 5: Review and commit
git add src/app/login/
git commit -m "feat: add Login page from Figma"
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `.figma/export-config.json` | Figma file config |
| `.figma/token-mapping.json` | Design token mapping |
| `.figma/specs/component-manifest.json` | Component index |
| `.figma/specs/README.md` | Full documentation |
| `.figma/UPDATE_SUMMARY.md` | Latest changes |
| `CLAUDE.md` | Complete integration guide |

---

## Next Steps

1. ✅ Configuration complete
2. ⏭️ Generate components: `npm run figma:generate -- --all`
3. ⏭️ Test in browser: `npm start`
4. ⏭️ Review generated code
5. ⏭️ Commit to repo

---

**Quick Help**: See `/home/frisco/projects/fiutami/.figma/specs/README.md` for detailed docs
