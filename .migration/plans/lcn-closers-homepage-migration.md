# LCN Closers Homepage Migration Plan

## Goal
Migrate the LCN Closers homepage (https://www.lcnclosers.com/en/index.html) to AEM Edge Delivery Services, authored in Document Authoring (DA). The DA content source is already linked to this repo (`allegion-global-web/lcn-test`). The migration covers the page content, the header/navigation, the footer and the site design.

## Scope (confirmed)
- **Pages:** the homepage only. Other pages and templates can be added in later runs.
- **Included:** page content, header/navigation, footer, design and styling.
- **Not included yet:** the rest of the site, committing and pushing code, and publishing live.

## Current State
- The repo is a fresh project with the standard blocks (cards, columns, footer, fragment, header, hero, widget).
- The project settings already point at DA content for `allegion-global-web / lcn-test`.
- No page analysis, import scripts or migrated content exist yet.

## Approach
1. **Project setup:** confirm the project type (DA) and the block library, and record them in the project settings.
2. **Page template:** classify the homepage URL into a page template so the import script has a stable name.
3. **Page analysis:** capture the homepage (screenshot, cleaned HTML, metadata), find its sections, and decide which parts become blocks and which stay as default content. Each block gets a variant name.
4. **Block generation:** for each block the page needs, reuse an existing block or build a new one or a new variant. Then check that the generated code is valid.
5. **Block mapping:** map each block to its DOM selectors on the original page.
6. **Import infrastructure:** generate parsers for each block and cleanup/section transformers. If the original images come from Dynamic Media, handle them as well.
7. **Content import:** generate the homepage import script, run the import, and check the content it produces.
8. **Header/navigation:** analyze the desktop and mobile header and any mega-menu, build the nav content and header block, and check it against the original.
9. **Footer:** find the footer sections, build the footer content and block, and check it on desktop and mobile.
10. **Design migration:** extract design tokens (colors, fonts, spacing) into global styles, style each block to match the original, and compare the preview against the source.
11. **Visual check:** compare the full page in the preview against the original and fix any differences.
12. **Upload to DA (needs your OK):** upload the homepage, nav and footer pages to DA and preview them. I'll ask before writing anything to DA or the preview environment. Nothing goes live.

## Checklist
- [ ] Confirm the project type (DA) and the block library in the project settings
- [ ] Classify the homepage into a page template
- [ ] Analyze the homepage (sections, blocks, variants, screenshot, metadata)
- [ ] Generate or augment the blocks the homepage needs, and check them
- [ ] Map each block to its selectors on the source page
- [ ] Generate parsers and transformers (include Dynamic Media handling if needed)
- [ ] Generate the homepage import script
- [ ] Run the content import and check the imported homepage in the preview
- [ ] Offer to refine the generated blocks against the imported content
- [ ] Migrate the header/navigation (desktop, mobile, mega-menu) and check it
- [ ] Migrate the footer (desktop, mobile) and check it
- [ ] Extract design tokens and apply global styles
- [ ] Style each migrated block to match the original
- [ ] Run a full-page visual comparison and fix the differences
- [ ] Ask before uploading the homepage, nav and footer to DA and previewing them (nothing goes live)
- [ ] Summarize what changed in the local workspace, DA and the preview environment

## Notes and Constraints
- All work happens locally first. Nothing is written to DA, previewed or published without your explicit approval.
- Code is not committed or pushed unless you ask. Any pull request must include a branch preview link (`{branch}--lcn-test--Allegion-Global-Web.aem.page/{path}`).
- Running the import again will overwrite any manual edits to the imported content.
- Plan mode is on, so carrying out this plan needs Execute mode.
