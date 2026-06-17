import { HeroPointSettings } from './apps/hero-settings';
import { MythicPointSettings } from './apps/mythic-settings';
import { applyMigrations } from './migrations/migrations';

export const MODULE_ID = 'hero-shmero-points';

const defaults = {
  HeroPoints: {
    Icon: 'fa-circle-h'
  },
  MythicPoints: {
    Icon: 'fa-circle-m'
  }
};

Hooks.once('ready', async () => applyMigrations());

Hooks.once('i18nInit', () => {
  game.settings.registerMenu(MODULE_ID, 'HeroPoints', {
    name: `${MODULE_ID}.Settings.Hero.MenuName`,
    hint: `${MODULE_ID}.Settings.Hero.MenuHint`,
    label: `${MODULE_ID}.Settings.Hero.MenuBtnLabel`,
    icon: `fa-solid ${defaults.HeroPoints.Icon}`,
    type: HeroPointSettings,
    restricted: true
  });
  HeroPointSettings.registerSettings();

  game.settings.registerMenu(MODULE_ID, 'MythicPoints', {
    name: `${MODULE_ID}.Settings.Mythic.MenuName`,
    hint: `${MODULE_ID}.Settings.Mythic.MenuHint`,
    label: `${MODULE_ID}.Settings.Mythic.MenuBtnLabel`,
    icon: `fa-solid ${defaults.MythicPoints.Icon}`,
    type: MythicPointSettings,
    restricted: true
  });
  MythicPointSettings.registerSettings();

  loadDefaults();
  applyLabelChanges();
});

Hooks.once('getChatMessageContextOptions', (html, opts) => {
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  const opt = opts.find((e) =>
    mythic
      ? e.name === 'PF2E.RerollMenu.MythicPoint' || e.label === 'PF2E.RerollMenu.MythicPoint'
      : e.name === 'PF2E.RerollMenu.HeroPoint' || e.label === 'PF2E.RerollMenu.HeroPoint'
  );
  if (!opt) return;

  const defaultIcon = mythic ? defaults.MythicPoints.Icon : defaults.HeroPoints.Icon;

  foundry.utils.mergeObject(opt, {
    icon: opt.icon.replace(new RegExp(`(fa-)?${defaultIcon.substring(3)}`), getIconName())
  });
});

Hooks.on('renderCharacterSheetPF2e', () => {
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  const icon = mythic ? defaults.MythicPoints.Icon : defaults.HeroPoints.Icon;
  const elements = document.querySelectorAll(`.sheet.actor.character i.${icon}`);

  for (const el of elements) {
    applyCSSReplacement(el);
  }
});

Hooks.on('renderChatMessageHTML', (message, html) => {
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  const icon = mythic ? defaults.MythicPoints.Icon : defaults.HeroPoints.Icon;

  applyCSSReplacement(html.querySelector(`i.${icon}`));
});

Hooks.on('renderBasePF2eHUD', (html) => {
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  const section = mythic ? 'mythic-points' : 'hero-points';
  const icon = mythic ? defaults.MythicPoints.Icon : defaults.HeroPoints.Icon;

  for (const el of html.element.querySelectorAll(`.pf2e-hud-element .statistics .heroPoints i.${icon}`)) {
    applyCSSReplacement(el);
  }

  const el = html.element.querySelector(`div[data-section="${section}"] i.${icon}`);
  applyCSSReplacement(el);
});

Hooks.once('setup', async () => {
  await Promise.all(
    game.messages.map(async (message) => {
      if (message.flavor.includes(defaults.HeroPoints.Icon)) {
        return message.update();
      }
    })
  );
});

/**
 * Applies the custom icon setting to an element
 * @param {HTMLElement} el
 */
function applyCSSReplacement(el) {
  if (!el) return;

  let icon = getIconName();
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  if ((mythic && icon === defaults.MythicPoints.Icon) || (!mythic && icon === defaults.HeroPoints.Icon)) return;

  const defaultIcon = mythic ? defaults.MythicPoints.Icon : defaults.HeroPoints.Icon;
  icon = icon.split(' ');

  el.classList.replace(defaultIcon, icon.at(0));
  if (icon.length > 1) el.classList.add(icon.slice(1));
}

function applyLabelChanges() {
  applyObjectChanges(game.i18n.translations, {
    defaults: defaults.HeroPoints,
    singular: game.settings.get(MODULE_ID, `HeroPoints.LabelSingular`) ?? defaults.HeroPoints.LabelSingular,
    plural: game.settings.get(MODULE_ID, `HeroPoints.LabelPlural`) ?? defaults.HeroPoints.LabelPlural,
    useAn: game.settings.get(MODULE_ID, 'HeroPoints.UseArticleAn')
  });

  applyObjectChanges(game.i18n.translations, {
    defaults: defaults.MythicPoints,
    singular: game.settings.get(MODULE_ID, `MythicPoints.LabelSingular`) ?? defaults.MythicPoints.LabelSingular,
    plural: game.settings.get(MODULE_ID, `MythicPoints.LabelPlural`) ?? defaults.MythicPoints.LabelPlural,
    useAn: game.settings.get(MODULE_ID, 'MythicPoints.UseArticleAn')
  });
}

function applyObjectChanges(obj, labels) {
  const { defaults, singular, plural, useAn } = labels;

  return Object.entries(obj).forEach(([k, v]) => {
    if (k === MODULE_ID) return;

    if (typeof v === 'string') {
      if (v.includes(defaults.LabelPlural)) {
        obj[k] = v.replace(defaults.LabelPlural, plural);
      } else if (v.includes(defaults.LabelSingular)) {
        if (useAn && new RegExp(`a ${defaults.LabelSingular}`).test(v)) {
          obj[k] = v.replace(`a ${defaults.LabelSingular}`, `an ${singular}`);
        } else {
          obj[k] = v.replace(defaults.LabelSingular, singular);
        }
      }
    } else {
      applyObjectChanges(v, labels);
    }
  });
}

function getIconName() {
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  let value = game.settings.get(MODULE_ID, mythic ? 'MythicPoints.Icon' : 'HeroPoints.Icon');

  if (!value) value = mythic ? defaults.MythicPoints.Icon : defaults.HeroPoints.Icon;
  else if (!value.startsWith('fa-')) value = `fa-${value}`;

  return value;
}

function loadDefaults() {
  defaults.HeroPoints.LabelSingular = game.i18n.translations[MODULE_ID].Defaults.Hero.LabelSingular;
  defaults.HeroPoints.LabelPlural = game.i18n.translations[MODULE_ID].Defaults.Hero.LabelPlural;

  defaults.MythicPoints.LabelSingular = game.i18n.translations[MODULE_ID].Defaults.Mythic.LabelSingular;
  defaults.MythicPoints.LabelPlural = game.i18n.translations[MODULE_ID].Defaults.Mythic.LabelPlural;
}
