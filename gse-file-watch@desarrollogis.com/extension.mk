
EXTENSION_NAME=$(shell basename $(PWD))

all-extension:
	@echo make extension-install
	@echo make extension-enable
	@echo make extension-disable
	@echo make extension-full-debug
	@echo make extension-debug

extension-install: ~/.local/share/gnome-shell/extensions/$(EXTENSION_NAME)
	@echo run alt-f2 and then r to restart gnome

extension-enable:
	gnome-extensions enable $(EXTENSION_NAME)

extension-disable:
	gnome-extensions disable $(EXTENSION_NAME)

extension-full-debug:
	journalctl -f -o cat /usr/bin/gnome-shell

extension-debug:
	journalctl -f -o cat /usr/bin/gnome-shell GNOME_SHELL_EXTENSION_UUID=$(EXTENSION_NAME)

~/.local/share/gnome-shell/extensions/$(EXTENSION_NAME):
	ln -s $(PWD) $@
