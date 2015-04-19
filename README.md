## raml-workflow

Basic RAML workflow that will use RAML2HTML with browserSync to refresh a API doc on change.

Took a bit of running around the web to get a good RAML workflow. Hope this helps save some time.

### Install

* **Install**: raml2md globaly: npm i -g raml2md
* **Run**: npm install

### Tasks

**Markdown Conversion:**

Run: *npm run build*

**HTML Conversion:**

Run: *gulp apidoc*

**HTML Conversion with Live Reload:**

Run: *gulp serve*

**Listing with Fancy Output:**

Run: *gulp rlint*

Dependencies/External Scripts:

* RAML to HTML: [https://www.npmjs.com/package/raml2html](https://www.npmjs.com/package/raml2html)
* RAML to HTML Gulp Gist: [https://gist.github.com/iki/784ddd5ab33c1e1b726b](https://gist.github.com/iki/784ddd5ab33c1e1b726b)
* RAML to MD: [https://github.com/kevinrenskers/raml2md](https://github.com/kevinrenskers/raml2md)
* Linting: [https://www.npmjs.com/package/gulp-raml](https://www.npmjs.com/package/gulp-raml)