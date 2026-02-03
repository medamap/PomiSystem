# Naming Review Report: pomi-storage.js

## 1. Summary

The current pomi-storage.js file handles not only local storage operations but also core logic for MSX UI orchestration and image conversion. This dual responsibility makes the filename misleading. Renaming it to a more descriptive name is recommended.

## 2. Renaming Candidates

Based on the file's role as a primary controller for the MSX conversion UI, the following names are suitable:

*   **pomi-msx-main.js (Recommended):** Clearly indicates its central role.
*   pomi-msx-controller.js: Accurately reflects its responsibility for managing UI and logic.
*   pomi-msx-ui.js: Focuses on the UI aspect.
*   pomi-msx-orchestrator.js: Highlights its role in coordinating different modules.

## 3. Dependencies and Risks

*   **Dependencies:**
    *   cs/PomiSystem.Blazor/wwwroot/index.html: Directly references the file via a <script> tag.
    *   cs/PomiSystem.Blazor/Pages/Quick.razor: Interacts with the window.pomiStorage and window.pomiMsx objects defined in the file.
*   **Risks:**
    *   **Broken References:** The primary risk is a broken script reference in index.html if not updated. A project-wide search for the filename is needed to mitigate this.
    *   **Developer Misunderstanding:** Keeping the name pomi-storage.js could lead future developers to mistakenly add non-storage related functions, increasing its complexity. Renaming clarifies its purpose.

## 4. Suggested Migration Steps (Minimal Risk)

To minimize risk, the renaming should only affect the filename, not the JavaScript objects (window.pomiStorage, window.pomiMsx) it defines.

1.  **Rename File:** Rename cs/PomiSystem.Blazor/wwwroot/js/pomi-storage.js to cs/PomiSystem.Blazor/wwwroot/js/pomi-msx-main.js.
2.  **Update index.html:** Change the <script src="js/pomi-storage.js?..."> tag in cs/PomiSystem.Blazor/wwwroot/index.html to reflect the new filename.
3.  **Verify:** Rebuild the Blazor application and perform functional testing on the Quick Convert page, especially MSX conversion, zoom, and download features.

This approach requires no changes to the Blazor C# code, limiting the scope of change and potential for regressions.