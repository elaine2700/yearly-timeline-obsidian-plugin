# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-31

### Added
- **Frontmatter Name Support**: Tooltip now displays the `name` from note frontmatter when present, otherwise falls back to the file name.

## [1.1.1] - 2026-02-10

### Changed
- **Dynamic Category Colors**: Replaced the static category mapping with a dynamic 12-color palette.
- **Discovery Order Assignment**: Colors are now assigned sequentially to categories as they are discovered (based on chronological note order).
- **Improved Legend**: The legend now automatically updates to show all discovered categories in their assignment order.

## [1.1.0] - 2026-02-10

### Added
- **Category Support**: Notes can now be categorized using the `category` frontmatter property.
- **Color Coding**: Automatically assigns unique colors to supported categories (`work`, `personal`, `health`, `finance`, `education`, `hobbies`).
- **Category Legend**: Added a legend button in the top-left of the view to display active categories and their colors.
- **Status Support**:
    - **In-Progress**: Notes with only a `startDate` are automatically marked as "In-Progress", extending to today's date with 50% saturation.
    - **Done**: Notes with both `startDate` and `endDate` are shown with 100% saturation.
- **Visual Enhancements**: Added hover effects (slight scale and brightness) to timeline blocks and improved tooltips with category information.

### Changed
- Improved date normalization logic to handle missing end dates more gracefully.
- Updated `README.md` with new configuration instructions.

## [1.0.0] - 2026-01-10

### Added
- Initial release of Yearly Timeline plugin for Obsidian.
- Basic vertical timeline layout.
- Year selection support.
- Note navigation (click to open).
