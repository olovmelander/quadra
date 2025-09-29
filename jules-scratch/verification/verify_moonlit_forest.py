from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    # Get the absolute path to the index.html file
    index_path = os.path.abspath('index.html')

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Set a larger viewport to ensure all modal elements are visible
    page.set_viewport_size({"width": 1280, "height": 1024})

    # Go to the local index.html file
    page.goto(f'file://{index_path}')

    # Wait for the start modal to be fully visible
    expect(page.locator('#start-modal')).to_be_visible()

    # Press a key to dismiss the start modal
    page.keyboard.press('Enter')

    # Wait for the modal to disappear
    expect(page.locator('#start-modal')).not_to_be_visible()

    # Open settings
    page.locator('#settings-btn').click()

    # Wait for the settings modal to be visible
    settings_modal = page.locator('#settings-modal')
    expect(settings_modal).to_be_visible()

    # Change background mode to "Specific" to enable the theme selector
    page.locator('#background-mode').select_option('Specific')

    # Select the new "Moonlit Forest" theme
    page.locator('#background-theme').select_option('moonlit-forest')

    # Close the settings modal to see the theme
    page.locator('#close-settings').click()

    # Wait for the theme to become active and animations to start
    expect(page.locator('#moonlit-forest-theme')).to_have_class('theme-container active')
    page.wait_for_timeout(3000) # Wait 3 seconds for animations to fully render

    # Take a screenshot for visual verification
    page.screenshot(path="jules-scratch/verification/moonlit_forest_theme.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

print("Verification script executed and screenshot taken.")