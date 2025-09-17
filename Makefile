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

update_prod:
	eas update --branch production --message 'Update 1.0.07 Testing'

build_dev_ios:
	eas build --platform ios --profile development

build_dev_android:
	eas build --platform android --profile development