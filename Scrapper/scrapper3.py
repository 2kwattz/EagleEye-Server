from CloudflareBypasser import CloudflareBypasser
import sys
import time
import random
from DrissionPage import ChromiumPage,ChromiumOptions
from DrissionPage.errors import WaitTimeoutError
from botasaurus.browser import browser, Wait,Driver
import random
import json
from bs4 import BeautifulSoup



def get_value_from_soup(soup, label):
    try:
        title_div = soup.find("div", id="title", string=label)
        if title_div:
            value_div = title_div.find_next_sibling("div", id="value")
            return value_div.get_text(strip=True) if value_div else "N/A"
        return "N/A"
    except Exception as e:
        print(f"[X] Error parsing {label}: {e}")
        return "N/A"


@browser(headless=False)
def botr_scrapper(driver: Driver, data=None):
    # helper: fetch element text by XPath


    link = 'https://fingerprint.com/products/bot-detection/'
    driver.get("https://www.google.com/")
    driver.enable_human_mode()
    driver.get_via_this_page(link, bypass_cloudflare=True)
    time.sleep(15)
    driver.long_random_sleep()

    driver.disable_human_mode()


    for i in range(1, 10):
        reg = f"CB-800{i}"
        print(f"\n🔎 Searching: {reg}")

        # 1) Go to home page and click the search button
        driver.get_via_this_page("https://www.airnavradar.com", bypass_cloudflare=True)
        driver.enable_human_mode()

        consent_btn = driver.select(".fc-cta-consent", wait=10)

        if consent_btn:
            print("✅ Found and clicked the 'Consent' button.")
            consent_btn.click()
        else:
            print("❌ Consent button not found. Just like her loyalty.")

   
        search_btn = driver.select("#search > button", wait=9)
        if not search_btn:
            print(f"❌ Search button not found for {reg}")
            continue
        search_btn.click()

        # 2) Type the registration and wait for the result link
        driver.type("#input-container input", reg, wait=5)
        link_elem = driver.select(f"a.ListItemLabel[href*='/data/registration/{reg}']", wait=8)

        driver.disable_human_mode()
        if not link_elem:
            print(f"❌ No result link found for {reg}")
            continue

        # 3) Build the full URL and navigate
        href = link_elem.get_attribute("href")
        if href.startswith("/"):
            href = "https://www.airnavradar.com" + href
        print(f"⏩ Redirecting to: {href}")
        driver.get_via_this_page(href, bypass_cloudflare=True)
        driver.enable_human_mode()
        driver.long_random_sleep()

        html = driver.page_html

        soup = BeautifulSoup(html, "html.parser")

        time.sleep(15)


        # 5) Scrape the fields via your original XPaths
        latitude  = get_value_from_soup(soup, "Latitude")
        longitude = get_value_from_soup(soup, "Longitude")
        altitude  = get_value_from_soup(soup, "Altitude")
        heading   = get_value_from_soup(soup, "Heading")
        source    = get_value_from_soup(soup, "Source")



        # 6) Print your scraped data
        print("\n--- Scraped Data ---")

        print("Latitude:          ", latitude)
        print("Longitude:         ", longitude)
        print("Altitude:          ", altitude)
        print("Heading:           ", heading)
        print("Source:           ", source)

        driver.disable_human_mode()
     

# Run the scraper
botr_scrapper()
