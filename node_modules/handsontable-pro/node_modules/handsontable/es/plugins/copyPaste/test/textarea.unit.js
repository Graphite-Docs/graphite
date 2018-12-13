import Textarea from './../textarea';

describe('CopyPaste', function () {
  describe('Textarea', function () {
    it('should create global textarea on construct', function () {
      var textarea = new Textarea();

      expect(textarea.refCounter).toBeDefined();
      expect(textarea.refCounter).toBe(0);
    });

    it('should create global textarea element without appending to the DOM', function () {
      var textarea = new Textarea();

      expect(textarea.element).toBeUndefined();

      textarea.create();

      expect(textarea.element).toBeDefined();
    });

    it('should append global textarea element into document.body', function () {
      var textarea = new Textarea();

      expect(textarea.element).toBeUndefined();

      textarea.append();

      expect(textarea.element).toBeDefined();
      expect(textarea.isAppended).toBeTruthy();
    });

    it('should get global singleton\'s textarea element, without creating the new one', function () {
      var textarea1 = Textarea.getSingleton();

      expect(textarea1.refCounter).toBe(1);

      var textarea2 = Textarea.getSingleton();

      expect(textarea1.refCounter).toBe(2);
      expect(textarea1.element).toBe(textarea2.element);
      textarea1.destroy();
      textarea2.destroy();
    });

    it('should focus on global textarea element', function () {
      var textarea = Textarea.getSingleton();

      textarea.select();

      expect(textarea.isActive()).toBeTruthy();
      textarea.destroy();
    });

    it('should set new value into textarea element', function () {
      var textarea = Textarea.getSingleton();
      var newValue = 'zxcvb';

      expect(textarea.element.value.length).toBe(1);

      textarea.setValue(newValue);

      expect(textarea.element.value).toBe(newValue);

      textarea.destroy();
    });

    it('should get actual value from textarea element', function () {
      var textarea = Textarea.getSingleton();
      var newValue = 'zxcvb';

      expect(textarea.getValue().length).toBe(1);

      textarea.setValue(newValue);

      expect(textarea.getValue()).toBe(newValue);

      textarea.destroy();
    });

    it('should destroy textarea element only after last reference', function () {
      var textarea1 = Textarea.getSingleton();
      var textarea2 = Textarea.getSingleton();

      expect(textarea2.refCounter).toBe(2);

      textarea1.destroy();

      expect(textarea2.refCounter).toBe(1);
      expect(textarea2.element).toBeDefined();

      textarea2.destroy();

      expect(textarea2.refCounter).toBe(0);
      expect(textarea2.element).toBeNull();
    });
  });
});