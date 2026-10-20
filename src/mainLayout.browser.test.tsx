import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {page} from "vitest/browser";
import {render} from "preact";
import "./index.css";
import {StateContext} from "./StateContext.tsx";
import {MainLayout} from "./mainLayout.tsx";

describe('MainLayout screenshots', () => {
  let root: HTMLDivElement;
  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);
    render(<StateContext><MainLayout/></StateContext>, root);
  });
  afterEach(() => {
    render(null, root);
    root.remove();
  });

  const screenshot = (name: string) => expect(page.elementLocator(document.body)).toMatchScreenshot(name);
  const selectUnits = async () => {
    await page.getByAltText('7w.5b.1w', {exact: true}).first().click();
    await page.getByAltText('4w.5b.5w', {exact: true}).first().click();
  };
  const setModifiersTerrainRange = async () => {
    await page.getByAltText('dugin', {exact: true}).last().click();
    await page.getByAltText('suppressed', {exact: true}).last().click();
    await page.getByAltText('suppressed', {exact: true}).last().click();
    await page.getByAltText('buildings', {exact: true}).click();
    await page.getByRole('button', {name: '3', exact: true}).click();
  };
  const rollDice = async () => {
    await page.elementLocator(document.querySelectorAll('svg circle')[0].closest('div')!).click();
  };

  it('initial', async () => {
    await screenshot('initial');
  });

  it('units selected', async () => {
    await selectUnits();
    await screenshot('units-selected');
  });

  it('modifiers, terrain and range', async () => {
    await selectUnits();
    await setModifiersTerrainRange();
    await screenshot('modifiers-terrain-range');
  });

  it('dice rolled', async () => {
    await selectUnits();
    await setModifiersTerrainRange();
    await rollDice();
    await screenshot('dice');
  });

  it('info view', async () => {
    await selectUnits();
    await setModifiersTerrainRange();
    await rollDice();
    await page.getByRole('button', {name: '📝'}).click();
    await screenshot('info-view');
  });

  it('step losses', async () => {
    await selectUnits();
    // the last added unit is selected
    await page.getByAltText('2', {exact: true}).last().click();
    await screenshot('step-losses');
  });

  it('point fire', async () => {
    await page.getByAltText('14y.9b.0b.2.milan', {exact: true}).first().click();
    await page.getByAltText('5y.10b.0b.2.at', {exact: true}).first().click();
    await page.getByRole('button', {name: 'Area'}).click();
    await page.getByRole('button', {name: '3', exact: true}).click();
    await rollDice();
    await screenshot('point-fire');
    await page.getByRole('button', {name: '📝'}).click();
    await screenshot('point-fire-info');
  });

  it('switch sides', async () => {
    await selectUnits();
    await page.getByRole('button', {name: '🔄'}).click();
    await screenshot('switched-sides');
  });
});
