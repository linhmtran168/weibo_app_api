run-production:
	@NODE_ENV=production forever /home/linhtm/sites/WeiboAppAdmin -l forever_weiboApp.log -o logs/out.log -e logs/err.log -a app.js

restart:
	@NODE_ENV=production forever restart

.PHONY: run-production restart
