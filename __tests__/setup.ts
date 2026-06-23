// jsdom doesn't implement scrollIntoView; the editor tabs auto-scroll uses it.
// Stub it to a no-op so components that call it during effects don't crash.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {
    /* no-op for tests */
  }
}
