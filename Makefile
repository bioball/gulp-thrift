test:
	mocha --reporter spec --compilers coffee:coffee-script/register test/*.coffee

.PHONY: test