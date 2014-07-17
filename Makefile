run-production:
	@NODE_ENV=production forever start -l forever_weiboApp.log -o logs/out.log -e logs/err.log -a app.js

restart:
	@NODE_ENV=production forever restart n8Bc

deploy:
	git push && git push repo && git push dev

.PHONY: run-production restart deploy
