import { test, expect, Page } from "@playwright/test";
import { chromium } from "playwright";
import contents from "../contents/personal-data";

// =============================================================================

async function runTestFlow(page: Page) {
	// -----------------------------------------------------------------------------
	console.log("▬▶ Tab: Personal data");

	await page.fill("input#txtNomeCompleto", contents.txtNomeCompleto);
	await page.fill("input#txtSobrenome", contents.txtSobrenome);
	await page.fill("input#txtNomeAnterior", contents.txtNomeAnterior);
	await page.check(
		`input[type="radio"][name="idRadioSexo"][value="${contents.idRadioSexo.toUpperCase()}"]`
	);
	await page.selectOption("select#idCondicaoEspecial", {
		label: contents.idCondicaoEspecial.toUpperCase(),
	});
	await page.fill("input#calDtNascInputDate", contents.calDtNascInputDate);
	await page.selectOption("select#cmbTipoEstadoCivil", {
		label: contents.cmbTipoEstadoCivil.toUpperCase(),
	});
	await page.fill("input#txtCidadeNascimento", contents.txtCidadeNascimento);
	await page.selectOption("select#cmbPaisNascimento", {
		label: contents.cmbPaisNascimento,
	});
	await page.selectOption("select#paisNacionalidade", {
		label: contents.paisNacionalidade,
	});
	await page.fill("input#txtEmail", contents.txtEmail);

	await page
		.locator("textarea#idDescricaoOcupacao")
		.pressSequentially(contents.idDescricaoOcupacao.toUpperCase());
	await page
		.locator('#j_id193 table[id="j_id193:suggest"] tr', {
			hasText: contents.idDescricaoOcupacao.toUpperCase(),
		})
		.click();

	await page.fill("input#cpf", '');
	await page.fill("input#cpf", contents.cpf);
	// await page.locator("input#cpf").pressSequentially(contents.cpf, { delay: 500 });

	await page.fill("input#txtNomeDaMae", contents.txtNomeDaMae);
	await page.check(
		`input[type="radio"][name="txtSexoDaMae"][value="${contents.txtSexoDaMae.toUpperCase()}"]`
	);

	await page.fill("input#txtNomePai", contents.txtNomePai);
	await page.check(
		`input[type="radio"][name="txtSexoDoPai"][value="${contents.txtSexoDoPai.toUpperCase()}"]`
	);

	await page.check(
		`input[type="radio"][name="j_id249"][value="${contents.j_id249.toUpperCase()}"]`
	);
	await page.fill("input#txt-rne", contents["txt-rne"]);
	
	await page.locator('#statusAjax-ajaxStatusMPContainer').waitFor({ state: 'hidden' });
	await page.click("input#idAvancarMail");


	// -----------------------------------------------------------------------------
	console.log("▬▶ Tab: Registry data");
	await page.check(
		`input[type="radio"][name="idPossuiRnm"][value="${contents.idPossuiRnm.toUpperCase()}"]`
	);
	await page.fill("input#txtRne", contents.txtRne);
	await page.check(
		`input[type="radio"][name="idDependente"][value="${contents.idDependente.toUpperCase()}"]`
	);

	await page.check(
		`input[type="radio"][name="possuiVisto"][value="${contents.possuiVisto}"]`
	);

	await page.click("input#idAvancarConcessaoVisto");
	await page.locator('#statusAjax-ajaxStatusMPContainer').waitFor({ state: 'hidden' });


	// -----------------------------------------------------------------------------
	console.log("▬▶ Tab: Address");

	await page.selectOption("select#txtUf", {
		label: contents.txtUf,
	});

	console.log("▬▶ Waiting cities…");
	await page.waitForFunction((selector) => {
		const select = document.querySelector(selector);
		return select && select.querySelectorAll('option').length > 1;
	}, 'select#comboCidadeEndResidencial');
	console.log("…continue!");

	await page.fill("input#cep1", '');
	await page
		.locator("input#cep1")
		.pressSequentially(contents.cep1);
	await page.keyboard.press('Tab');

	console.log("▬▶ Waiting loader…");
	await page.waitForFunction(([parentSelector, childSelector]) => {
		const parent = document.querySelector(parentSelector);
		const child = document.querySelector(childSelector);
		return !!(parent && child && parent.contains(child));
	}, ['#statusAjax-ajaxStatusMP', '#statusAjax-ajaxStatusMPContainer']);
	console.log("…continue!");

	await page.selectOption("select#comboCidadeEndResidencial", {
		label: contents.comboCidadeEndResidencial,
	});

	await page.fill("input#txtLogradouro", contents.txtLogradouro);
	await page.fill("input#txtComplemento", contents.txtComplemento);
	await page.fill("input#txtDistritoBairro", contents.txtDistritoBairro);

	await page.fill("input#telefone", contents.telefone);
	
	await page.check('input[type="checkbox"]#naoPossuiEnderecoComercial');
	await page.fill("input#idContatoNome", contents.idContatoNome);
	await page.fill("input[id='telefone-contato']", contents['telefone-contato']);
	await page.fill("input#idVinculoContato", contents.idVinculoContato);
	await page.selectOption("select#idContatoPais", {
		label: contents.idContatoPais,
	});
	await page.click("input#idAvancar");
	await page.locator('#statusAjax-ajaxStatusMPContainer').waitFor({ state: 'hidden' });


	// -----------------------------------------------------------------------------
	console.log("▬▶ Tab: Declaration");
	await page.check('input[type="checkbox"]#declaracao');
	console.log("▬▶ Please click ReCaptcha and Save");


	// -----------------------------------------------------------------------------
	// Finish
	await page.pause(); // <!> for development
	console.log("▬▶ Done!");
	expect(true).toBe(true);
}

// =============================================================================

test("Sistema de Registro Nacional Migratório / Segunda via de CRNM", async () => {
	test.setTimeout(5 * 60 * 1000);
	// test.setTimeout(15 * 1000);

	const browser = await chromium.launch({
		headless: false,
		args: ["--disable-blink-features=AutomationControlled"],
	});

	const context = await browser.newContext({
		viewport: null,
		deviceScaleFactor: undefined,
	});

	const page = await context.newPage();

	// await page.setViewportSize({ width: 1920, height: 1080 });

	const destination = 'https://servicos.dpf.gov.br/sismigra-internet/faces/publico/tipoSolicitacao/solicitarSegundaViaCie.seam';
	const expired = 'https://servicos.dpf.gov.br/sismigra-internet/faces/publico/expirou.seam';

	page.on("framenavigated", async (frame) => {
		console.warn("Frame navigated to:", frame.url());
		if (frame.url().startsWith(expired)) {
			await page.goto(destination);
			await runTestFlow(page);
		}
	});

	await page.goto(destination, { waitUntil: 'load' });
	await page.waitForTimeout(2500);
	await runTestFlow(page);
});
