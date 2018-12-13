## Release History

### 2017-09-06 *v4.2.1*
Fixes: handling of empty srcs

### 2017-09-06 *v4.2.0*
Fixes: Skip inlining of srcs that are already data uris

### 2017-09-06 *v4.1.1*
Fixes: buffer.toString() encoding fix for nodejs 8

### 2017-03-06 *v4.1.0*
Fixes: Use `rebaseRelativeTo` if it is defined; Fix to rebase urls that appear on the same line; Support fragment URLs when getting inline file path. [PR Ref](https://github.com/jrit/web-resource-inliner/pull/27)

### 2016-11-17 *v4.0.0*
Breaking: min engine is now v4.2; Feat: escape `"</script>"` strings in script tags, improved multiline support

### 2016-09-07 *v3.0.0*
Breaking: Removed `cssmin` option; Feat: New `linkTransform` option which can replace cssmin, and is more flexible

### 2016-03-30 *v2.0.0*
Feat: SVG `use` inlining; Feat: requestTransform; Fix: default gzip handling

### 2015-11-03 *v1.2.1*
Fix: HTTP status codes undefined

### 2015-10-23 *v1.2.0*
Enhancement: Strip value of data-inline(-ignore) attributes  

### 2015-10-23 *v1.1.5*
Fix: Unescape HTML entities in the URLs extracted from attributes. Fix: Move callback outside of `try` block

### 2015-09-28 *v1.1.4*
Fixes relativeTo support for images

### 2015-07-23 *v1.1.2*
Multiline support

### 2015-04-19 *v1.1.1*
Fixes to regex usage from PRs 3 and 4

### 2015-02-27 *v1.1.0*
Enhancement: add `strict` option and change behavior to be `false` by default. Previous behavior was equivalent to `strict=true`.

### 2015-02-26 *v1.0.2*
Fix: pass file missing errors up through callbacks

### 2015-02-18 *v1.0.1*
use relativeTo with URLs to resolve web paths; use https: as default when paths start with //

### 2015-01-01 *v1.0.0*
initial release: Forked and rewritten from grunt-inline with the goal of providing additional use cases and a new API
