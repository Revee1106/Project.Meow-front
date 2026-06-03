import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [320, 360, 480] as const;
const ROUTES = [
  { name: "home", path: "/", readySelector: ".home-page" },
  { name: "floor", path: "/floor/2", readySelector: ".floor-page" },
  {
    name: "node-detail",
    path: "/floor/2?node=n_major",
    readySelector: ".node-sheet",
  },
] as const;

for (const viewportWidth of VIEWPORTS) {
  test.describe(`${viewportWidth}px mobile viewport`, () => {
    for (const route of ROUTES) {
      test(`${route.name} renders without horizontal overflow`, async ({
        page,
      }) => {
        await mockExternalFonts(page);
        const consoleErrors = collectConsoleErrors(page);
        const pageErrors = collectPageErrors(page);

        await page.setViewportSize({ width: viewportWidth, height: 760 });
        await page.goto(route.path);
        await expect(page.locator(route.readySelector)).toBeVisible();
        await expect(page.locator(".app-shell__safe-area")).toBeVisible();
        await expectNoHorizontalOverflow(page);

        expect(consoleErrors).toEqual([]);
        expect(pageErrors).toEqual([]);
        await expect(page).toHaveScreenshot(
          `${route.name}-${viewportWidth}.png`,
          {
            animations: "disabled",
            fullPage: false,
          },
        );
      });
    }
  });
}

async function mockExternalFonts(page: Page) {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({
      contentType: "text/css",
      body: "",
    }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) =>
    route.fulfill({
      status: 204,
      body: "",
    }),
  );
}

function collectConsoleErrors(page: Page) {
  const messages: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      messages.push(message.text());
    }
  });

  return messages;
}

function collectPageErrors(page: Page) {
  const messages: string[] = [];

  page.on("pageerror", (error) => {
    messages.push(error.message);
  });

  return messages;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );

    return {
      viewportWidth: window.innerWidth,
      scrollWidth,
    };
  });
  const shell = await page.locator(".app-shell__safe-area").boundingBox();

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
  expect(shell?.width ?? 0).toBeLessThanOrEqual(overflow.viewportWidth + 1);
}
