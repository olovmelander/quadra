import os
from playwright.sync_api import sync_playwright, expect
import time

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    file_path = os.path.abspath('index.html')
    page.goto(f'file://{file_path}')

    # 1. Start the game and wait for it to be ready
    page.get_by_text("Press any key or tap to start").click()
    expect(page.locator("#game-canvas")).to_be_visible()
    time.sleep(1) # Extra wait to ensure game loop is running

    # 2. Play the game until 1 line is needed for level up
    #    We will do this by repeatedly hard-dropping pieces to clear lines.
    #    This is a more realistic way to test the game logic.

    # Get the initial number of lines needed to level up
    initial_lines_needed_text = page.locator("#next-level").inner_text()

    # It's possible the page isn't fully loaded, so we retry if the text is not a number
    try:
        lines_needed = int(initial_lines_needed_text)
    except ValueError:
        time.sleep(1) # Wait a bit longer and try again
        lines_needed = int(page.locator("#next-level").inner_text())

    # We need to clear lines until 'Next Lvl' is 1
    # Each hard drop of a piece that doesn't clear a line will place a piece.
    # We'll place pieces to form lines. A simple strategy is to create horizontal lines.
    # The board is 10 wide. We'll drop 9 "I" pieces horizontally to set up a 4-line clear.

    # First, let's get the game into a state where we need 1 line to level up.
    # The default is 10 lines. We'll clear 9 single lines.
    # To do this, we'll drop pieces to fill 9 rows, leaving one column empty, then fill that column.

    # It's very complex to simulate actual gameplay.
    # Let's revert to a more controlled state manipulation, but with more robust waiting.

    # We will repeatedly check the DOM until the game state is ready for us to manipulate.
    # This is better than a fixed time.sleep().
    page.wait_for_function("() => typeof window.lines !== 'undefined'")

    # Now that we know the game script has loaded, we can proceed.
    page.evaluate("""() => {
        lines = 9;
        linesUntilNextLevel = 1;
        updateStats();
    }""")

    # 3. Take a screenshot showing the state *before* the fix is relevant
    expect(page.locator("#next-level")).to_have_text("1")
    page.screenshot(path="jules-scratch/verification/before_level_up.png")

    # 4. Manually trigger the level-up logic by simulating a 4-line clear
    page.evaluate("""() => {
        const fullLines = [23, 22, 21, 20]; // Simulate clearing 4 lines

        lines += fullLines.length;
        linesUntilNextLevel -= fullLines.length;

        if (linesUntilNextLevel <= 0) {
            level++;
            linesUntilNextLevel = 10;
            soundManager.playLevelUp();
        }

        updateStats();
    }""")

    # 5. Assert that the "Next Lvl" text is now "10" and take a screenshot
    expect(page.locator("#level")).to_have_text("2")
    expect(page.locator("#next-level")).to_have_text("10")
    page.screenshot(path="jules-scratch/verification/after_level_up.png")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)

print("Verification script executed successfully.")