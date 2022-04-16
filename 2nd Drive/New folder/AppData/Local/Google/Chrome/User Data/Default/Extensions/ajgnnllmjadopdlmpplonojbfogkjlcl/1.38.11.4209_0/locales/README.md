Translations
============

PasswordBox translation files.

### Source files

the `en_US` files are the source ones. `inpages.json` contains all the strings related to the inpage actions, and the `extension.json` file contains all the strings found within the extension.

`welcome.yml` contains the website's strings, but is not needed at all in this repo - it's here only because our translation provider's API gives us everything bundled together.

### Smartling

All content across all targets is translated by a 3rd party called [Smartling](http://www.smartling.com).

### When add, removing or modifying strings in the source files

Always make the change on the candidate branch, and upload your changes to Smartling so that they can translate it as soon as possible. When pulling the changes from Smartling, push the changes to the `candidate` branch. Once the QA team has validated everything, you can merge the changes to the `master` branch.

### Changing strings in other languages

If you have to change a translated string (for example, changing a badly translated french string), **always do it in Smartling's platform**. Otherwise your change will be overwritten the next time we pull the translations from Smartling.