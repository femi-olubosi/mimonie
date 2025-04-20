update_remote:
	git add .
	@echo "Please enter your commit message:"; read -r message; git commit -m "$$message"
	git push origin dev