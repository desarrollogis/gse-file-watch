MK:=$(subst .mk,,$(wildcard *.mk))

all:
	@for command in $(MK);do make --no-print-directory all-$$command;done

include *.mk
