---
name: Eco-Community & Coffee Farming
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#42493e'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#6f5a53'
  on-secondary: '#ffffff'
  secondary-container: '#fadcd3'
  on-secondary-container: '#765f59'
  tertiary: '#1f4022'
  on-tertiary: '#ffffff'
  tertiary-container: '#365837'
  on-tertiary-container: '#a6cda3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#fadcd3'
  secondary-fixed-dim: '#ddc0b8'
  on-secondary-fixed: '#271813'
  on-secondary-fixed-variant: '#56423c'
  tertiary-fixed: '#c5edc1'
  tertiary-fixed-dim: '#aad1a7'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#2c4e2e'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  button:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  touch-target-min: 56px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-padding: 32px
---

## Brand & Style
This design system is built upon a philosophy of **Modern Minimalism with an Organic Touch**. It prioritizes clarity and accessibility for a demographic that includes local farmers and elderly users, ensuring the interface feels grounded and trustworthy rather than overly "tech-focused."

The aesthetic avoids cartoonish or playful illustrations in favor of high-quality photography and structural elegance. By leveraging generous white space and tactile, soft-edged elements, the interface mimics the calm of a natural environment while maintaining the precision of a professional agricultural tool.

## Colors
The palette is rooted in the natural lifecycle of coffee farming. 
- **Deep Forest Green (#2D5A27)** serves as the primary brand color, used for key actions and headers to establish growth and stability.
- **Earthy Brown (#4B3832)** provides a grounded secondary tone for text, secondary buttons, and structural accents, echoing the soil.
- **Soft Leaf Green (#8DB38B)** acts as a functional accent for highlights, success states, and subtle decorative elements.
- The background uses a warm off-white neutral to reduce eye strain and provide a softer contrast than pure white.

## Typography
**Be Vietnam Pro** is utilized across all levels to ensure high legibility. To accommodate elderly users and farmers who may be viewing the screen in varied lighting conditions:
- **Base font size** is elevated to 18px-20px for body text.
- **Line height** is kept generous (1.6x) to prevent lines from blurring together.
- **Weight** is used strategically; headlines are bold and authoritative, while body copy maintains a medium weight to ensure strokes are thick enough for easy reading.

## Layout & Spacing
The layout follows a **fluid grid** with an emphasis on "Safe Zones."
- **Touch Targets:** A strict minimum height of 56px is applied to all interactive elements (exceeding the 48dp standard) to ensure ease of use for those with reduced dexterity.
- **Padding:** Internal container padding is generous (32px) to prevent the UI from feeling cramped.
- **White Space:** Functional white space is used as a separator rather than thin lines, creating a breathable, low-stress user experience.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and tonal layering. 
- Shadows are highly diffused (Blur: 30px+, Spread: 0), using a low-opacity Deep Forest Green or Brown tint rather than pure black to maintain an organic feel.
- Elements utilize a "Stacked Paper" approach where the most important cards have a slight elevation, while secondary information remains flat on the background.
- Overlays use a soft backdrop blur to maintain context without visual clutter.

## Shapes
The design system employs a **Large Border-Radius (24px - 32px)** to evoke an organic, friendly, and safe character. 
- Primary cards and containers use a 32px radius.
- Buttons and input fields use a pill-shape (fully rounded) or a minimum of 24px radius to ensure consistency.
- Sharp corners are entirely avoided to maintain the "organic touch" narrative.

## Components
- **Buttons:** Large, pill-shaped targets (min 56px height). Primary buttons use Deep Forest Green with white text. High contrast is mandatory.
- **Cards:** White or very light green backgrounds with a 32px radius and soft ambient shadows. Cards should have clear, single-action focus.
- **Inputs:** Oversized fields with 24px radius and 2px Deep Forest Green borders when active. Labels are always persistent above the field (never hidden as placeholders).
- **Selection (Checkboxes/Radio):** Significantly enlarged (32px x 32px) with Earthy Brown borders for high visibility.
- **Farming Stats:** Custom "Soil & Growth" indicators using Leaf Green progress bars with thick, rounded caps.
- **Lists:** High-density lists are avoided. Instead, use "List Cards" with vertical spacing of at least 16px between items to prevent accidental taps.