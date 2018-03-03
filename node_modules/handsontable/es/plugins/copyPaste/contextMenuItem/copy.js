import * as C from './../../../i18n/constants';

export default function copyItem(copyPastePlugin) {
  return {
    key: 'copy',
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_COPY);
    },
    callback: function callback() {
      copyPastePlugin.copy();
    },
    disabled: function disabled() {
      return !copyPastePlugin.hot.getSelected();
    },

    hidden: false
  };
}