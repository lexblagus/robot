import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';
import contents from '../constants/contents';

test('Fillup Google Application profile', async () => {
  // Setup
  test.setTimeout(5 * 60 * 1000);
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  
  // Login
  await page.goto('https://accounts.google.com/');
  await page.fill('input[id="identifierId"]', 'blagus@gmail.com');
  await page.click('button:has-text("Next")');
  await page.fill('input[name="Passwd"]', 'blagus0arroba1gmail');
  await page.click('button:has-text("Next")');
  const locatorNotNow = page.locator('button:has-text("Not now")');
  if (await locatorNotNow.count() > 0) {
    await locatorNotNow.click();
  }
  await page.waitForURL('https://myaccount.google.com/*');
  const locatorWelcome = page.locator('h1:has-text("Welcome, Lex Blagus")');
  await expect(locatorWelcome).toHaveCount(1);
  

  // Edit
  await page.goto('https://www.google.com/about/careers/applications/profile');
  await page.click('button:has-text("Edit")');
  const locatorWorkExperience = page.locator('h2:has-text("Work experience") >> .. >> ..');
  

  // Reset
  const locatorRemoveJob = locatorWorkExperience.locator('button:has-text("remove this job")');
  while (await locatorRemoveJob.count() > 0) {
    await locatorRemoveJob.first().click();
  }
  
  
  // Experiences
  const locatorJobs = locatorWorkExperience.locator('> div > div > ul');
  for (let i = 0; i < contents.experience.data.length; i++) {
    const experience = contents.experience.data[i];
    console.log(i, experience.company);

    // Add job
    const locatorJobsItems = locatorJobs.locator('> li');
    if(i > 0){
      const locatorAnotherJob = locatorWorkExperience.locator('button:has-text("add another job")');
      await locatorAnotherJob.click();
    }
    const locatorJobItem = locatorJobsItems.nth(i);
    
    // Fill
    const periodStartMonth = experience.period.start[0];
    const periodStartYear = experience.period.start[1];
    const periodEndMonth = experience.period.end[0];
    const periodEndYear = experience.period.end[1];
  
    const locatorExployerName = locatorJobItem.locator('input[aria-label="Employer name"]');
    await locatorExployerName.fill(experience.company);

    const locatorJobTitle = locatorJobItem.locator('input[aria-label="Job title"]');
    await locatorJobTitle.fill(experience.title);
  
    const locatorStartDate = locatorJobItem.locator('span:has-text("Start date:")').locator('..');
  
    const locatorComboboxStartMonth = locatorStartDate.locator('[role="combobox"]:has(span:has-text("Month"))');
    await locatorComboboxStartMonth.click();
    const locatorListItemStartMonth = locatorComboboxStartMonth.locator('..').locator(`li[data-value="${periodStartMonth}"]`)
    await locatorListItemStartMonth.click();
  
    const locatorStartYear = locatorStartDate.locator('input[aria-label="Year"]');
    await locatorStartYear.fill(periodStartYear.toString());
  
    const locatorEndDate = locatorJobItem.locator('span:has-text("End date:")').locator('..');
  
    const locatorComboboxEndMonth = locatorEndDate.locator('[role="combobox"]:has(span:has-text("Month"))');
    await locatorComboboxEndMonth.click();
    const locatorListItemEndMonth = locatorComboboxEndMonth.locator('..').locator(`li[data-value="${periodEndMonth}"]`)
    await locatorListItemEndMonth.click();
  
    const locatorEndYear = locatorEndDate.locator('input[aria-label="Year"]');
    await locatorEndYear.fill(periodEndYear.toString());
  
    const locatorComboboxCountryRegion = locatorJobItem.locator('[role="combobox"]:has(span:has-text("Country / Region"))');
    await locatorComboboxCountryRegion.click();
    const locatorListItemCountryRegion = locatorComboboxCountryRegion.locator('..').locator('li[data-value="BR"]');
    await locatorListItemCountryRegion.click();
  
    const locatorCity = locatorJobItem.locator('input[aria-label="City"]');
    await locatorCity.fill('São Paulo');
  
    const locatorState = locatorJobItem.locator('input[aria-label="State"]');
    await locatorState.fill('São Paulo');
  }


  // Consent
  const locatorCheckboxes = page.locator('input[type="checkbox"]');
  const locatorCheckboxesCount = await locatorCheckboxes.count();
  await locatorCheckboxes.nth(locatorCheckboxesCount - 2).check();
  await locatorCheckboxes.nth(locatorCheckboxesCount - 1).check();


  // Submit
  const locatorSubmit = page.locator('button[aria-label="Submit"]');
  console.log('Please review all the information before continue!')
  await page.pause();
  await locatorSubmit.last().click();


  console.log('Done!');
  expect(true).toBe(true);
});
