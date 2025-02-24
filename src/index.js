import { HeroPointSettings } from './apps/hero-settings';
import { applyMigrations } from './migrations/migrations';

export const MODULE_ID = 'hero-shmero-points';

const defaults = {
  HeroPoints: {
    Icon: 'fa-hospital-symbol'
  }
};

Hooks.once('init', () => {
  game.settings.registerMenu(MODULE_ID, 'HeroPoints', {
    name: `${MODULE_ID}.Settings.Hero.MenuName`,
    hint: `${MODULE_ID}.Settings.Hero.MenuHint`,
    label: `${MODULE_ID}.Settings.Hero.MenuBtnLabel`,
    type: HeroPointSettings,
    restricted: true
  });
  HeroPointSettings.registerSettings();
});

Hooks.once('ready', async () => applyMigrations());

Hooks.once('i18nInit', () => {
  loadDefaults();
  applyLabelChanges();
});

Hooks.once('getChatLogEntryContext', (html, opts) => {
  const opt = opts.find((e) => e.name === 'PF2E.RerollMenu.HeroPoint');
  if (!opt) return;

  foundry.utils.mergeObject(opt, { icon: opt.icon.replace(defaults.HeroPoints.Icon, getIconName()) });
});

Hooks.on('renderCharacterSheetPF2e', () => {
  const value = getIconName();

  for (const el of document.querySelectorAll(`.sheet.actor.character i.${defaults.HeroPoints.Icon}`)) {
    el.classList.replace(defaults.HeroPoints.Icon, value);
  }
});

Hooks.on('renderChatMessage', (message, html) => {
  html.find(`i.${defaults.HeroPoints.Icon}`).first().removeClass(defaults.HeroPoints.Icon).addClass(getIconName());
});

Hooks.on('renderPF2eHudBaseActor', (html) => {
  const el = html.element.querySelector('div[data-section="hero-points"] i.fa-circle-h');
  el?.classList.replace('fa-circle-h', getIconName());
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

function applyLabelChanges() {
  const singular = getLabel('LabelSingular');
  const plural = getLabel('LabelPlural');
  const useAn = game.settings.get(MODULE_ID, 'HeroPoints.UseArticleAn');

  applyObjectChanges(game.i18n.translations, { singular, plural, useAn });
}

function applyObjectChanges(obj, labels) {
  const { singular, plural, useAn } = labels;

  return Object.entries(obj).forEach(([k, v]) => {
    if (k === MODULE_ID) return;

    if (typeof v === 'string') {
      if (v.includes(defaults.HeroPoints.LabelPlural)) {
        obj[k] = v.replace(defaults.HeroPoints.LabelPlural, plural);
      } else if (v.includes(defaults.HeroPoints.LabelSingular)) {
        if (useAn && new RegExp(`a ${defaults.HeroPoints.LabelSingular}`).test(v)) {
          obj[k] = v.replace(`a ${defaults.HeroPoints.LabelSingular}`, `an ${singular}`);
        } else {
          obj[k] = v.replace(defaults.HeroPoints.LabelSingular, singular);
        }
      }
    } else {
      applyObjectChanges(v, labels);
    }
  });
}

function getIconName() {
  let value = game.settings.get(MODULE_ID, 'HeroPoints.Icon');

  if (!value) value = defaults.heroPointIcon;
  else if (!value.startsWith('fa-')) value = `fa-${value}`;

  return value;
}

function getLabel(key) {
  const mythic = game.pf2e.settings.campaign.mythic !== 'disabled';
  let value;

  if (mythic) {
    value = game.settings.get(MODULE_ID, `HeroPoints.${key}`) ?? defaults.MythicPoints[key];
  } else {
    value = game.settings.get(MODULE_ID, `HeroPoints.${key}`) ?? defaults.HeroPoints[key];
  }

  return value;
}

function loadDefaults() {
  defaults.HeroPoints.LabelSingular = game.i18n.translations[MODULE_ID].Defaults.Hero.LabelSingular;
  defaults.HeroPoints.LabelPlural = game.i18n.translations[MODULE_ID].Defaults.Hero.LabelPlural;
}
