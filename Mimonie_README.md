# Mimonie App

## Overview
The Mimonie App is a robust mobile application designed to simplify and enhance group financial contributions and payments. Built with a focus on efficiency, user security, and a seamless user experience, the app offers advanced features such as biometric identity verification, financial record management, and secure payment processing. 

## Key Features
### User Authentication and Identity Verification
- **Biometric Verification**: Integrated using the Smile Identity SDK.
- **Income Verification**: Implemented via Paystack for BVN and account validation.
- **Secure Sign-Up and Login**: Ensures user data safety with JWT-based authentication.

### Financial Contributions
- **Flexible Contribution Management**: Users can create, join, and manage financial contribution groups.
- **Payment Processing**: Utilizes Paystack for seamless and secure payments.
- **Income-Based Contribution Limits**: Ensures participants contribute within their verified income range.

### Device and Profile Management
- **Device Linking**: Tracks devices associated with user accounts for enhanced security.
- **User Profiles**: Stores essential information, including avatars and financial verification statuses.

### Notifications
- **Push Notifications**: Implemented using Expo for iOS and Android.
- **Real-Time Alerts**: Keeps users informed about payments, contribution statuses, and account activities.

### Admin Features
- **User Management**: Admins can view, delete, and manage user profiles.
- **Data Analytics**: Includes dashboard metrics like total users, verified users, and contribution summaries.

## Tools and Technologies
### Frontend
- **React Native** (Expo): Provides cross-platform support for iOS and Android.
- **TypeScript**: Ensures robust type-checking and cleaner code.

### Backend
- **AWS Amplify**: Handles authentication, API integration, and storage.
- **DynamoDB**: NoSQL database for efficient data storage and retrieval.
- **Node.js**: Backend scripting and integration.

### Payment and Identity Verification
- **Smile Identity SDK**: For biometric identity verification.
- **Paystack**: For financial transactions and income verification.

### Other Tools
- **Tanstack React Query**: Simplifies state management for asynchronous operations.
- **AsyncStorage**: Local storage solution for managing user sessions.
- **Expo Router**: Enables smooth navigation between app screens.

## Implementation Highlights
1. **Splash Screen Update**:
   - Developed and optimized for both iOS and Android platforms.
2. **Contribution Features**:
   - Allows users to share invite links for joining contributions.
   - Ensures seamless navigation to specific contribution screens.
3. **Income Verification**:
   - Validates user income ranges before allowing group participation.
4. **Real-Time Features**:
   - Push notifications ensure users remain updated on their activities.

## Contribution
We welcome contributions to the Mimonie App. Here's how you can contribute:

### Reporting Issues
- Submit bug reports and feature requests via the GitHub issues page.

### Developing Features
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Added feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

### Documentation
Help us improve the documentation by clarifying existing content or adding new sections.

### Testing
- Write tests for new and existing features to maintain code reliability.

## License
The Mimonie App is licensed under the MIT License. See the LICENSE file for more details.

## Contact
For inquiries, please reach out to the development team at [support@mimonie.com](mailto:support@mimonie.com).
