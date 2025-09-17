const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const userProfileTableName = 'UserProfile-d4itlx42uzhtrctybtkmaxruya-dev';

const userProfileModel = {
  async listUserProfiles(
    lastEvaluatedKey = null,
    limit = 20,
    searchTerm = null
  ) {
    const params = {
      TableName: userProfileTableName,
      IndexName: 'CreatedAtIndex',
      KeyConditionExpression: '#typename = :type',
      ExpressionAttributeNames: {
        '#typename': '__typename',
      },
      ExpressionAttributeValues: {
        ':type': 'UserProfile',
      },
      ScanIndexForward: false, // False = Descending order
      Limit: limit,
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    if (searchTerm) {
      params.FilterExpression =
        'contains(#name, :searchTerm) OR contains(email, :searchTerm) OR contains(phone_number, :searchTerm)';
      params.ExpressionAttributeValues[':searchTerm'] = searchTerm;
      params.ExpressionAttributeNames['#name'] = 'name';
    }

    const result = await ddbDocClient.send(new QueryCommand(params));

    // Standardize the fields across all profiles
    const defaultFields = {
      id: null,
      userId: null,
      name: null,
      email: null,
      phone_number: null,
      address: null,
      birthdate: null,
      country_of_residence: null,
      country_of_origin: null,
      occupation: null,
      income_from: null,
      income_to: null,
      is_bvn_verified: null,
      is_nin_verified: null,
      device_id: null,
      device_name: null,
      device_brand: null,
      phone_verified: null,
      auth_url: null,
      push_token: null,
      createdAt: null,
      updatedAt: null,
      _version: null,
      _deleted: null,
      _ttl: null,
      customer_code: null,
    };

    const standardizedItems = result.Items.map((item) => ({
      ...defaultFields,
      ...item,
    }));

    return {
      items: standardizedItems,
      nextToken: result.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : null,
    };
  },

  async getUserSummary() {
    // 🔹 Step 1: Get Total Users
    const totalUsersParams = {
      TableName: userProfileTableName,
      Select: 'COUNT', // Only return count
    };
    const totalUsersResult = await ddbDocClient.send(
      new ScanCommand(totalUsersParams)
    );
    const totalUsers = totalUsersResult.Count;

    // 🔹 Step 2: Get Users with Verified BVN
    const bvnVerifiedParams = {
      TableName: userProfileTableName,
      FilterExpression: 'is_bvn_verified = :trueVal',
      ExpressionAttributeValues: { ':trueVal': true },
      Select: 'COUNT',
    };
    const bvnVerifiedResult = await ddbDocClient.send(
      new ScanCommand(bvnVerifiedParams)
    );
    const totalBvnVerified = bvnVerifiedResult.Count;

    // 🔹 Step 3: Get Users with Verified KYC
    const ninVerifiedParams = {
      TableName: userProfileTableName,
      FilterExpression: 'is_nin_verified = :trueVal',
      ExpressionAttributeValues: { ':trueVal': true },
      Select: 'COUNT',
    };
    const ninVerifiedResult = await ddbDocClient.send(
      new ScanCommand(ninVerifiedParams)
    );
    const totalNinVerified = ninVerifiedResult.Count;

    // 🔹 Step 4: Get Users with Verified Phone
    const phoneVerifiedParams = {
      TableName: userProfileTableName,
      FilterExpression: 'phone_verified = :trueVal',
      ExpressionAttributeValues: { ':trueVal': true },
      Select: 'COUNT',
    };
    const phoneVerifiedResult = await ddbDocClient.send(
      new ScanCommand(phoneVerifiedParams)
    );
    const totalPhoneVerified = phoneVerifiedResult.Count;

    // 🔹 Return Summary
    return {
      totalUsers,
      totalBvnVerified,
      totalNinVerified,
      totalPhoneVerified,
    };
  },

  async deleteUserProfile(id) {
    const params = {
      TableName: userProfileTableName,
      Key: { id },
    };

    try {
      await ddbDocClient.send(new DeleteCommand(params));
      return { success: true, message: `User profile with id ${id} deleted.` };
    } catch (err) {
      console.error('Error deleting user profile:', err);
      return {
        success: false,
        message: 'Failed to delete user profile.',
        error: err,
      };
    }
  },
};

module.exports = userProfileModel;
