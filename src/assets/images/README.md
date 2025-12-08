# Auth Assets Required

## Background Image

**File:** `auth-bg.jpg`

**Description:** Full-screen background image for authentication pages (HomeStart, Login, Signup)

**Specifications:**
- Dimensions: 1920x1080 or higher (16:9 aspect ratio recommended)
- Format: JPG or WebP
- Features: Dog mascot or related imagery
- Color palette: Should work with `rgba(0,0,0,0.4)` overlay

**Usage:**
- HomeStartComponent
- LoginComponent
- SignupComponent

**Note:** Currently using placeholder. Replace with actual Figma export from design file 25uQUXz6gwFQKx4Wjp0dcc.

---

## Mascot Icon (Optional Enhancement)

The dog mascot SVG in HomeStartComponent is currently a simplified placeholder. For production:

1. Export mascot icon from Figma as SVG
2. Replace inline SVG in `home-start.component.html` (lines 24-30)
3. Or create separate component: `src/app/shared/mascot-icon/`

**Recommended approach:** Use Figma's SVG export with proper optimization for web.
