
build: $(wildcard *.js) node_modules components
	@./node_modules/.bin/component build --dev

components:
	@./node_modules/.bin/component install --dev

node_modules:
	@npm install --dev

clean:
	rm -rf build components

extension:
	~/Code/passwordbox/builder/bin/build.sh

.PHONY: clean components extension
