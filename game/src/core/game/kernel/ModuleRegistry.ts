import { DEFAULT_LANG, type LangCode } from '@/core/language';
import type { LearningModule } from './types';

/**
 * A module with the words of its cards in `lang`: the title, and each game's
 * name, blurb, intro and demo caption from `module.texts[lang]`. A game (or a
 * language) the module has no words for keeps the card's own — Ukrainian.
 * `getIntro` is bound to the language, so a caller need not pass it.
 */
function inLang(module: LearningModule, lang: LangCode): LearningModule {
  const texts = module.texts?.[lang];
  const { getIntro } = module;
  return {
    ...module,
    title: texts?.title ?? module.title,
    subCategories: module.subCategories.map((sub) => {
      const words = texts?.games[sub.id];
      const group = sub.group && texts?.groups?.[sub.group.id] ? { ...sub.group, label: texts.groups[sub.group.id] } : sub.group;
      if (!words) return group === sub.group ? sub : { ...sub, group };
      return {
        ...sub,
        group,
        label: words.label,
        blurb: words.blurb,
        intro: words.intro ?? sub.intro,
        demo: sub.demo && words.demoCaption && 'caption' in sub.demo ? { ...sub.demo, caption: words.demoCaption } : sub.demo,
      };
    }),
    getIntro: getIntro && ((subId, theme, step, asked) => getIntro(subId, theme, step, asked ?? lang)),
  };
}

class ModuleRegistry {
  private readonly modules = new Map<string, LearningModule>();
  private readonly local = new Map<string, LearningModule>();

  register(module: LearningModule): void {
    if (this.modules.has(module.id)) {
      // Idempotent in dev under React StrictMode / HMR double-import.
      return;
    }
    this.modules.set(module.id, module);
  }

  /** The module, the words of its cards in `lang` (Ukrainian — as they are written — by default). */
  get(id: string, lang: LangCode = DEFAULT_LANG): LearningModule | undefined {
    const module = this.modules.get(id);
    if (!module || lang === DEFAULT_LANG) return module;
    const key = `${id}|${lang}`;
    let made = this.local.get(key);
    if (!made) this.local.set(key, (made = inLang(module, lang)));
    return made;
  }

  getAll(lang: LangCode = DEFAULT_LANG): LearningModule[] {
    return [...this.modules.keys()].map((id) => this.get(id, lang) as LearningModule);
  }

  has(id: string): boolean {
    return this.modules.has(id);
  }
}

export const moduleRegistry = new ModuleRegistry();
