# ========== Git ==========
update_remote:
	git add .
	@echo "Please enter your commit message:"; \
	read -r message; \
	git commit -m "$$message"
	git push origin dev

# ========== Builds ==========
# Internal testing build (staging channel)
build_staging_android:
	eas build --platform android --profile staging

build_staging_ios:
	eas build --platform ios --profile staging

# Store release build (production channel)
build_prod_android:
	eas build --platform android --profile production

build_prod_ios:
	eas build --platform ios --profile production

# Development (local/dev client)
build_dev_android:
	eas build --platform android --profile development

build_dev_ios:
	eas build --platform ios --profile development-simulator

# ========== Submit to Stores ==========
# Submit staging build to Google Play internal track
submit_staging_android:
	eas submit --platform android --profile production --latest

submit_staging_ios:
	eas submit --platform ios --profile production --latest

# Submit production build to stores
submit_prod_android:
	eas submit --platform android --profile production --latest

submit_prod_ios:
	eas submit --platform ios --profile production --latest

# ========== OTA Updates ==========
# Push update to production branch (live users on store)
update_prod:
	eas update --branch production --message "Production update"

# Push update to staging branch (internal testers)
update_staging:
	eas update --branch staging --message "Staging update"

update_preview:
	eas update --branch preview --message "Preview update"
