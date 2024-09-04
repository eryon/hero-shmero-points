export const MODULE_ID = 'hero-shmero-points';

const defaults = { heroPointIcon: 'fa-hospital-symbol' };

Hooks.once('init', () => {
  game.settings.register(MODULE_ID, 'HeroPointLabelSingular', {
    name: 'Singular Label',
    hint: 'Enter the *singular* name or label you want to use for a "Hero Point"',
    default: 'Hero Point',
    config: true,
    requiresReload: true,
    scope: 'world',
    type: String
  });
  game.settings.register(MODULE_ID, 'HeroPointLabelPlural', {
    name: 'Plural Label',
    hint: 'Enter the *plural* label to use in instances of many "Hero Points"',
    default: 'Hero Points',
    config: true,
    requiresReload: true,
    scope: 'world',
    type: String
  });
  game.settings.register(MODULE_ID, 'HeroPointIcon', {
    name: 'Icon',
    hint: 'Enter a FontAwesome icon name to use in place of the standard (H) symbol, such as "fa-circle-v" to represent Villain Points. Find one at https://fontawesome.com/search',
    default: defaults.heroPointIcon,
    config: true,
    requiresReload: true,
    scope: 'world',
    type: String
  });
  game.settings.register(MODULE_ID, 'UseArticleAn', {
    name: 'Use indefinite article "an"',
    hint: 'When replacing the hero point label, also replace "a" with "an", so that "a Hero Point" becomes "an Hero Point"',
    default: false,
    config: true,
    requiresReload: true,
    scope: 'world',
    type: Boolean
  });
});

Hooks.once('i18nInit', () => {
  loadDefaults();
  applyLabelChanges();
});

Hooks.once('getChatLogEntryContext', (html, opts) => {
  const opt = opts.find((e) => e.name === 'PF2E.RerollMenu.HeroPoint');
  if (!opt) return;

  foundry.utils.mergeObject(opt, { icon: opt.icon.replace(defaults.heroPointIcon, getIconName()) });
});

Hooks.on('renderCharacterSheetPF2e', () => {
  const value = getIconName();

  for (const el of document.querySelectorAll(`.sheet.actor.character i.${defaults.heroPointIcon}`)) {
    el.classList.replace(defaults.heroPointIcon, value);
  }
});

Hooks.on('renderChatMessage', (message, html) => {
  html.find(`i.${defaults.heroPointIcon}`).first().removeClass(defaults.heroPointIcon).addClass(getIconName());
});

Hooks.on('renderPF2eHudBaseActor', (html) => {
  const el = html.element.querySelector('div[data-section="hero-points"] i.fa-circle-h');
  el?.classList.replace('fa-circle-h', getIconName());
});

Hooks.once('setup', async () => {
  await Promise.all(
    game.messages.map(async (message) => {
      if (message.flavor.includes(defaults.heroPointIcon)) {
        return message.update();
      }
    })
  );
});

function applyLabelChanges() {
  const singular = getLabel('HeroPointLabelSingular');
  const plural = getLabel('HeroPointLabelPlural');
  const useAn = game.settings.get(MODULE_ID, 'UseArticleAn');

  applyObjectChanges(game.i18n.translations, { singular, plural, useAn });
}

function applyObjectChanges(obj, labels) {
  const { singular, plural, useAn } = labels;

  return Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === 'string') {
      if (v.includes(defaults.HeroPointLabelPlural)) {
        obj[k] = v.replace(defaults.HeroPointLabelPlural, plural);
      } else if (v.includes(defaults.HeroPointLabelSingular)) {
        if (useAn && new RegExp(`a ${defaults.HeroPointLabelSingular}`).test(v)) {
          obj[k] = v.replace(`a ${defaults.HeroPointLabelSingular}`, `an ${singular}`);
        } else {
          obj[k] = v.replace(defaults.HeroPointLabelSingular, singular);
        }
      }
    } else {
      applyObjectChanges(v, labels);
    }
  });
}

function getIconName() {
  let value = game.settings.get(MODULE_ID, 'HeroPointIcon');

  if (!value) value = defaults.heroPointIcon;
  else if (!value.startsWith('fa-')) value = `fa-${value}`;

  return value;
}

function getLabel(key) {
  const value = game.settings.get(MODULE_ID, key);

  if (!value) return defaults[key];

  return value;
}

function loadDefaults() {
  defaults.HeroPointLabelSingular = game.i18n.translations[MODULE_ID].HeroPointLabelSingular;
  defaults.HeroPointLabelPlural = game.i18n.translations[MODULE_ID].HeroPointLabelPlural;
}
