export const MODULE_ID = 'hero-shmero-points';

const defaults = {
  heroPointIcon: 'fa-hospital-symbol',
  system: {
    HeroPointRatio: { Many: '', One: '' },
    HeroPointsLabel: '',
    RerollMenu: { HeroPoint: '', MessageHeroPoint: '', WarnNoHeroPoint: '' }
  },
  modules: [{ 'pf2e-hud': {} }, { 'xdy-pf2e-workbench': { SETTINGS: { heroPointHandler: {} } } }]
};

Hooks.once('init', () => {
  game.settings.register(MODULE_ID, 'HeroPointsLabel', {
    name: 'Label',
    hint: 'Enter the *singular* name or label you want to use for hero points',
    config: true,
    requiresReload: true,
    scope: 'world',
    type: String,
    onChange: applyLabelChange
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
});

Hooks.once('i18nInit', () => {
  loadDefaults();
  applyLabelChange(game.settings.get(MODULE_ID, 'HeroPointsLabel'));
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

function applyLabelChange(value) {
  foundry.utils.mergeObject(
    game.i18n.translations.PF2E,
    !!value ? createObjChange(defaults.system, value) : defaults.system
  );

  Object.entries(defaults.modules).forEach(([k, v]) => {
    if (game.modules.find((x) => x.id === k)?.active) {
      foundry.utils.mergeObject(game.i18n.translations[k], !!value ? createObjChange(v, value) : v);
    }
  });
}

function createObjChange(obj, value) {
  return Object.entries(obj).reduce((res, [k, v]) => {
    if (typeof v === 'string') {
      return {
        ...res,
        [k]: v.replace('Hero Point', value)
      };
    }

    return {
      ...res,
      [k]: createObjChange(v, value)
    };
  }, {});
}

function getIconName() {
  let value = game.settings.get(MODULE_ID, 'HeroPointIcon');

  if (!value) value = defaults.heroPointIcon;
  else if (!value.startsWith('fa-')) value = `fa-${value}`;

  return value;
}

function loadDefaults() {
  defaults.system = {
    HeroPointRatio: { ...game.i18n.translations.PF2E.HeroPointRatio },
    HeroPointsLabel: game.i18n.translations.PF2E.HeroPointsLabel,
    RerollMenu: { ...game.i18n.translations.PF2E.RerollMenu }
  };

  if (game.modules.find((x) => x.id === 'xdy-pf2e-workbench')?.active) {
    defaults.modules['xdy-pf2e-workbench'] = {
      SETTINGS: {
        heroPointHandler: {
          ...game.i18n.translations['xdy-pf2e-workbench'].SETTINGS.heroPointHandler
        }
      }
    };
  }
}
