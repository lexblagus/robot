import React from 'react';
import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';
import credentials from '../../secret/braintrust';
import contents from '../constants/contents';
import ReactDOMServer from 'react-dom/server';


const extractText = (element) => {
    if (typeof element === 'string') return element;
    if (Array.isArray(element)) return element.map(extractText).join('');
    if (element.props.children) return extractText(element.props.children);
    return '';
};


// UNFINISHED WORK
test.skip('Fillup Braintrust Work history', async () => {
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
	await page.goto('https://www.usebraintrust.com/');
	await page.click('a:has-text("Log in")');
	
	await page.waitForURL('https://app.usebraintrust.com/auth/login/*');
	await page.setViewportSize({ width: 1920, height: 1080 });
	await page.fill('input[id="email-address"]', credentials.identifier);
	await page.fill('input[id="password"]', credentials.password);
	await page.click('button:has-text("Sign in")');
	await page.waitForURL('https://app.usebraintrust.com/talent/dashboard/welcome/');


	// Work history
	await page.goto('https://app.usebraintrust.com/talent/1336269/');
	await page.setViewportSize({ width: 1920, height: 1080 });


	// Reset
	const locatorEditExperience = page.locator('button[aria-label="Edit experience"]');
	if ( await locatorEditExperience.count() > 0 ) {
		await locatorEditExperience.click();
		const locatorJobDelete = page.locator('button[aria-label="delete work history"]');
		for (let i = 0; i < await locatorJobDelete.count(); i++) {
			await locatorJobDelete.nth(i).click();
			await page.click('button:has-text("Remove job")');
		}
		await page.click('button[aria-label="Close modal"]');
	}
	
	// Add experience
	await page.click('button:has-text("Add work history")');

	for (let i = 0; i < contents.experience.data.reverse().length; i++) {
		const experience = contents.experience.data[i];
		console.log(i, experience.company);
		
		// Add job
		await page.fill('input[id="title"]', experience.title);
		
		// <!> PROBLEM here: thisis a combo-box
		await page.fill('input[id="new_company"]', experience.company);
		
		await page.locator('label#month_from-label + [data-testid="select-component"]').click();
		await page.locator('ul[aria-labelledby="month_from-label"]>li').nth(experience.period.start[0] - 1).click();

		await page.fill('input[id="year_from"]', String(experience.period.start[1]));
		

		await page.locator('label#month_to-label + [data-testid="select-component"]').click();
		await page.locator('ul[aria-labelledby="month_to-label"]>li').nth(experience.period.end[0] - 1).click();

		await page.fill('input[id="year_to"]', String(experience.period.end[1]));
		
		const description = (
			(
				experience.about
					? `About: ${experience.about}` + '\n'
					: ''
			)
			+ (
				experience.clients.length > 0
					? `Clients: ${experience.clients.map(item => extractText(item)).join(', ')}` + '\n'
					: ''
			)
			+ (
				experience.attributions.length > 0
					? '\n'
						+ 'Attributions'
						+ '\n'
						+ experience.attributions
							.map(item => extractText(item))
							.map(text => `● ${text}`)
							.join('\n')
						+ '\n'
					: ''
			)
			+ (
				experience.achievements.length > 0
					? '\n'
						+ 'Achievements'
						+ '\n'
						+ experience.achievements
							.map(item => extractText(item))
							.map(text => `⏶ ${text}`)
							.join('\n')
						+ '\n'
					: ''
			)
			+ (
				experience.technologies.length > 0
					? '\n'
						+ 'Technologies'
						+ '\n'
						+ experience.technologies
							.map(item => extractText(item))
							.map(text => `▪ ${text}`)
							.join('\n')
						+ '\n'
					: ''
			)
			+ ''
		).trim();
		console.log(description + '\n');
		await page.fill('textarea[id="description"]', description);
		await page.click('button:has-text("Save")');
		//...
	}


	console.log('Done!');
	expect(true).toBe(true);
});
