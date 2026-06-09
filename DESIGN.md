---
version: alpha
name: Scramble HQ Masters
description: A commissioner-first golf scramble workspace with Masters-inspired branding.
colors:
  primary: "#076652"
  primary-dark: "#043E33"
  accent: "#FFDF00"
  background: "#F5F2E7"
  surface: "#FFFDF4"
  text: "#111C18"
  muted: "#5D6861"
  line: "#CBD8CE"
typography:
  display:
    fontFamily: Newsreader
    fontSize: 2.5rem
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: 0
  body:
    fontFamily: Libre Franklin
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: Libre Franklin
    fontSize: 0.75rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0
rounded:
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-focus:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.md}"
  nav-active:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
  metric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  metric-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
  metadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
  divider:
    backgroundColor: "{colors.line}"
    textColor: "{colors.text}"
  table-header:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
---

## Overview

The app should feel like a tournament operations desk: crisp, fast to scan, and rooted in golf tradition. The Masters references are direct in color but restrained in application. Green carries structure and authority. Yellow is an accent for focus, selection, and brand energy, not a broad background.

## Colors

Use Masters Green `#076652` as the primary brand color and `#FFDF00` as the yellow accent. Keep large work areas warm ivory so score entry, money tracking, and tables remain readable during repeated use.

## Typography

Use Newsreader for event names and section headings to add tournament character. Use Libre Franklin for controls, tables, metrics, and body copy because this is an operational tool.

## Layout

Prioritize compact, stable layouts. The first viewport should show brand, event context, active status, and the main work modes. Avoid decorative sections that push the tools down.

## Elevation & Depth

Use flat surfaces with thin borders. Shadows should be light and functional, mostly to separate the command header and data cards from the page.

## Shapes

Corners stay tight: 4px to 8px. Avoid pill-heavy styling unless the element is a true status chip.

## Components

Primary actions use green with white text. Active navigation uses green. Tables use green headers and ivory bodies. Metrics use ivory surfaces with green labels and display numerals.

## Do's and Don'ts

Do make the app feel like a working commissioner console. Do keep scoring and money data dense and legible. Do use the logo as a strong first-viewport signal.

Do not use purple-blue gradients, oversized marketing sections, nested decorative cards, or gray-on-gray generic dashboard styling.
