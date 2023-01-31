
all-schema:
	@echo make schema-debug
	@echo make schema-test

schema-debug:
	journalctl -f -o cat /usr/bin/gjs

schema-test: schemas/gschemas.compiled
	gnome-extensions prefs $(shell basename $(PWD))

schemas/gschemas.compiled: schemas/com.desarrollogis.*.gschema.xml
	glib-compile-schemas $(shell dirname $@)
