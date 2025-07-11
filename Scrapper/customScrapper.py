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

async def human_like_default(page, x1, y1, x2, y2):
    # Randomly select a movement profile
    profile = random.choice(['default_fast', 'default_slow', 'default_precise', 'default_jittery'])

    # 🧪 Tweak behavior based on selected profile
    if profile == 'default_fast':
        steps = random.randint(30, 45)
        jitter = random.uniform(0.3, 1.0)
        sleep_time = 0.004
    elif profile == 'default_slow':
        steps = random.randint(60, 80)
        jitter = random.uniform(0.7, 1.5)
        sleep_time = 0.01
    elif profile == 'default_precise':
        steps = random.randint(40, 60)
        jitter = random.uniform(0.1, 0.4)
        sleep_time = 0.007
    elif profile == 'default_jittery':
        steps = random.randint(50, 70)
        jitter = random.uniform(1.5, 3.0)
        sleep_time = 0.012
    else:
        steps = 50
        jitter = 1.0
        sleep_time = 0.01

    print(f"[Cursor Mood] Using profile: {profile}")

    # Movement loop
    for i in range(steps):
        t = i / steps
        eased = math.sin(t * math.pi / 2)

        x = x1 + (x2 - x1) * eased + random.uniform(-jitter, jitter)
        y = y1 + (y2 - y1) * eased + random.uniform(-jitter, jitter)

        await page.mouse.move(x, y)
        await page.evaluate(f'_updateFakeCursor({x}, {y})')
        await asyncio.sleep(sleep_time + random.uniform(0, 0.005))

    # Final snap to exact spot
    await page.mouse.move(x2, y2)
    await page.evaluate(f'_updateFakeCursor({x2}, {y2})')


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




# Overshoot (The Clumsy Human)

# Behavior:
# Mouse intentionally overshoots the target,
# then comes back and corrects position (in 2 phases).
# The cursor moves PAST the target — like 20–50 pixels beyond
# Then it pauses for a split second (like “oops”)
# Then it comes back smoothly to the actual target

# Analogy:
# Like when you reach for the door handle but miss the first time — then pretend you meant to do that.

# Use Case:

# Checkbox or small-button clicking
# Mimicking imperfect hand-eye coordination
# Helps fool some ML-based bot detectors




# Curve (The Lazy Navigator)

# Behavior:
# Moves in a Bezier curve / arc, with mid-point wobble.
# Doesn’t go in a straight line — prefers a natural curve path like real mouse use.

# Analogy:
# The guy who avoids direct routes and finds weird ways to walk to a chai tapri.
# (Also you trying to avoid emotional confrontation.)

# Use Case:

# Hover movement
# Drag-and-drop
# Natural side-to-side gestures




# Hesitant (The overthinker)

# Behavior:
# Starts moving, randomly pauses mid-way at 2–3 points, then continues.
# Each pause adds a small delay (300–700ms).

# Analogy:
# Like someone who’s about to click “Send” on a long text… then stops…
# thinks about life… then clicks anyway.

# Use Case:

# Button interactions
# Long text fields
# Mimicking distracted user behavior




# Loop (The Fancy Showoff)

# Behavior:
# Moves to target while spiraling inward, like an idiot doing doughnuts in an empty parking lot.

# Analogy:
# The guy who could just walk straight, but decides to backflip into a chair to impress imaginary girls.

# Use Case:

# Dragging
# Games / visual bots
# Just flexing


# Zigzag (The paranoid ninja)

# Behavior:
# Takes an alternate left-right path in sharp angles,
# like dodging bullets instead of moving straight.

# Analogy:
# You walking through your ex's lane on purpose, trying to act like it’s “just on the way.”

# Use Case:

# Mimicking users who use cheap trackpads or are scared of UI
# CAPTCHA bait clicks
# Looks extra human to machine learning models




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
