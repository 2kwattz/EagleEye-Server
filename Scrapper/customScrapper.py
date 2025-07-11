import tls_client # TLS Client Spoofer
import random 
import pyautogui
import math


# Global Variables 

GOOGLE_REFERER = "https://www.google.com/"

# Inject Fake Cursor (To Show Real Human like mouse movements)

async def inject_cursor(page):
    await page.add_init_script("""
(()=>{
    const cursor = document.createElement('div');
    cursor.id = 'cursor';  
    cursor.style.position = 'fixed';
    cursor.style.width = '12px';
    cursor.style.height = '12px';
    cursor.style.borderRadius = '50%';
    cursor.style.background = 'red';
    cursor.style.zIndex = 9999999;
    cursor.style.pointerEvents = 'none';
    cursor.style.transition = 'top 0.05s linear, left 0.05s linear';
    document.body.appendChild(cursor);

    window._updateFakeCursor = (x, y) => {
                cursor.style.left = x + 'px';
                cursor.style.top = y + 'px';
            };
        })();})                            
""")

async def move_mouse_with_cursor(page,x,y):
    await page.mouse.move(x, y)
    await page.evaluate(f'_updateFakeCursor({x}, {y})')


# Human Like Mouse Movements Personalities

# Human Like Default (The Chill Professional)

# Behavior:
# Moves smoothly from point A to B using easing (slow start, fast middle, slow end),
# with tiny human noise (±1px jitter).

# Analogy:
# Like a guy who's been using a mouse for 10 years. Confident. Not in a rush.
# Doesn't overshoot. Doesn’t hesitate. Unlike you texting "are you asleep?" at 2 AM.

# Use Case:

# General clicking
# Scrolling
# Any default interaction




# Shaky (The Nervous Intern)

# Behavior:
# Moves with Gaussian trembles on every step.
# Constant micro-shakes like someone holding coffee after 4 hours of debugging.

# Analogy:
# Like you during your first freelance pitch: confident in theory, shaking like your glucose levels in reality.

# Use Case:

# CAPTCHA sliders
# Hovering animations
# Mimicking “older user” mouse control




# Client Identifiers for TLS Client

client_identifiers = [
    "chrome_120",
    "chrome_119",
    "chrome_112",
    "chrome_108",
    "chrome_105",
    "chrome_104",
    "chrome_103",
    "chrome_102",
    "chrome_99",
    "chrome_96",
    "chrome_95",
    "chrome_92",
    "chrome_91",
    "chrome_90",
    "chrome_89",
    "chrome_88",
    "chrome_87",
    "chrome_86",
    "chrome_85",
    "chrome_83",
    "chrome_80",
    "firefox_110",
    "firefox_102",
    "firefox_91",
    "firefox_89",
    "safari_15_6_1",
    "safari_15_5",
    "safari_15_3",
    "safari_15_2",
    "safari_14",
    "safari_ios_16_0",
    "safari_ios_15_6",
    "opera_89",
    "opera_85"
]



def get_url(url):
    pass
