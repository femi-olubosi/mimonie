update_remote:
	git add .
	@echo "Please enter your commit message:"; read -r message; git commit -m "$$message"
	git push origin dev

build_android:
	eas build --platform android

build_ios:
	eas build --platform ios

submit_android:
	eas submit --platform android

submit_ios:
	eas submit --platform ios