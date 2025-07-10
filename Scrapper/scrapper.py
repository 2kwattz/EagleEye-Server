from CloudflareBypasser import CloudflareBypasser
import sys
import time
import random
from DrissionPage import ChromiumPage,ChromiumOptions
from DrissionPage.errors import WaitTimeoutError
from botasaurus.browser import browser, Driver
from botasaurus.browser import Wait
import random
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    stream=sys.stderr
)

log = logging.getLogger("ScraperLog")

# Tor Proxy

proxies = {
    'http': 'socks5h://127.0.0.1:9050',
    'https': 'socks5h://127.0.0.1:9050'
}



user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) Gecko/20100101 Firefox/79.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 11; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.88 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Linux; Android 9; Mi A2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:91.0) Gecko/20100101 Firefox/91.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Brave Chrome/89.0.4389.90 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/90.0.818.56",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/31.0 Mobile/15E148 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0",
    "Mozilla/5.0 (Linux; Android 8.1.0; Redmi Note 5 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) Gecko/20100101 Firefox/90.0",
    "Mozilla/5.0 (Linux; Android 11; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko)",
    "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
]

user_agent = random.choice(user_agents)



@browser(
    proxy=[
        "http://socks5h://127.0.0.1:9050"
    ],
    extensions=[
    ],
)

def main():

    if len(sys.argv) < 3:

        log.error("[PythonScrapper] Not enough arguments passed. Expecting: URL and operator/registration ")

        error_message = "Not enough arguments passed. Expecting: URL and operator/registration."
        print(json.dumps({
        "error": True,
        "message": error_message
        }))
        return
   

    url = sys.argv[1]
    identifier = sys.argv[2]

    # url = "https://www.airnavradar.com/data/registration/CB-8001"
    # identifier = "C17"

    def botr_scrapper(driver=Driver,url=url):

        number = random.randint(1, 5)

        if number == 1:
            driver.google_get(url,bypass_cloudflare=True)
        elif number == 2:
            driver.get(url,bypass_cloudflare=True)
        elif number == 3:
            driver.get_via(url, referer="https://www.airnavradar.com",bypass_cloudflare=True)
        elif number == 4:
            driver.get_via_this_page("https://www.airnavradar.com",bypass_cloudflare=True)
            element = driver.select("div#search.sc-1977lku-0.hMNAwC button", wait=Wait.short)
            element.click()
            driver.type("#input-container input", "CB-8001",wwait=Wait.short)
            regElement = driver.select("#identifier")
            regElement.click()


            
        Driver.google_get(url,bypass_cloudflare=True)
        Driver.prompt()

        



    try:
        # return

        options = ChromiumOptions()
        # options.headless(False)
        options.set_argument(f'--proxy-server=socks5://127.0.0.1:9050')
        # options.set_argument('--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost')
        options.set_argument(f'--user-agent={user_agent}')
        options.set_argument('--window-size=1920,1080')
        options.set_argument('--remote-debugging-port=9222')
        options.set_argument('--no-sandbox')


        options.set_argument("--disable-webrtc")  


        # options.set_argument('--headless=new')
        # Launch Chromium
        stealthDriver = ChromiumPage(options)


        # stealthDriver.get("https://api.ipify.org?format=json")
        # ip_ele = stealthDriver.ele("tag:pre") or stealthDriver.ele("tag:body")
        # ip_response = ip_ele.text if ip_ele else "IP not found"
        # ip_data = json.loads(ip_response)

        
        try:
            stealthDriver.get(url,timeout=100)
        
        except WaitTimeoutError:
            botr_scrapper(Driver,url)

        except Exception as e:
            botr_scrapper(Driver,url)
            

        


        # Bypass Cloudflare
        cf_bypasser = CloudflareBypasser(stealthDriver)
        cf_bypasser.bypass()

        time.sleep(random.uniform(2.5, 3.5))
        lat_ele = stealthDriver.ele('xpath://div[@id="title" and contains(text(), "Latitude")]/following-sibling::div[@id="value"]')
        lon_ele = stealthDriver.ele('xpath://div[@id="title" and contains(text(), "Longitude")]/following-sibling::div[@id="value"]')
        reg_ele = stealthDriver.ele('xpath://div[text()="Registration"]/following-sibling::div[1]')
        alt_ele = stealthDriver.ele('xpath://div[text()="Altitude"]/following-sibling::div[1]')
        aircraft_ele = stealthDriver.ele('xpath://div[text()="Aircraft Model"]/following-sibling::div[1]')
        last_activity_ele = stealthDriver.ele('xpath://div[text()="Last Activity"]/following-sibling::div[1]')
        last_known_location_ele = stealthDriver.ele('xpath://div[text()="Last Known Location"]/following-sibling::div[1]')
        heading_ele = stealthDriver.ele('xpath://div[text()="Heading"]/following-sibling::div[1]')





        if not lat_ele or not lon_ele:
            raise Exception("[PythonScrapper] Latitude or Longitude element not found")


        target_lat_str = lat_ele.text.strip()
        target_lon_str = lon_ele.text.strip()
        reg_ele = reg_ele.text.strip()
        alt_ele = alt_ele.text.strip()
        aircraft_ele = aircraft_ele.text.strip()
        last_activity_ele = last_activity_ele.text.strip()
        last_known_location_ele = last_known_location_ele.text.strip()
        heading_ele = heading_ele.text.strip()

        time.sleep(random.uniform(2, 4))

        target_lat = float(target_lat_str)
        target_lon = float(target_lon_str)

        result = {
        "error": False,
        "source": "PythonScrapper",
        "latitude": target_lat,
        "longitude": target_lon,
        "altitude": alt_ele,
        "registration": reg_ele,
        "lastActivity": last_activity_ele,
        "aircraftModel":aircraft_ele,
        "lastKnownLocation":last_known_location_ele,
        "heading": heading_ele,
        "currentIp": ip_data["ip"]
        }
        print(json.dumps(result))


        stealthDriver.quit()

    except Exception as e:

        error_result = {
        "error": True,
        "source": "PythonScrapper",
        "message": f"Failed to scrape {identifier}: {str(e)}",
        "currentIp": ip_data["ip"] or "Error"
    }
        print(json.dumps(error_result))

if __name__ == '__main__':
    main()
